// routes/admin.photos.routes.js
// Módulo unificado de Fotos (público + admin) en un solo archivo.
// -----------------------------------------------------------------------------
// Estructura:
// - Helpers/Utils compartidos
// - Router PÚBLICO   → export publicPhotosRouter (GET lista, GET detalle, POST visitas)
// - Router ADMIN     → export adminPhotosRouter  (POST crear, PUT editar, PATCH toggles/reorder, GET history)
// -----------------------------------------------------------------------------
// Notas:
// - El front crea con multipart/form-data: fields => image (binario), metadata (string JSON).
// - 'parseMetadata' inserta title/descriptionMd/etc. en req.body ANTES de validar.
// - 'imageUrl' se calcula en el servidor. No se valida desde el body.
// - Validadores de creación/edición vienen de validators/photos.js

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

const requireAuth = require("../middlewares/requireAuth");
const parseMetadata = require("../middlewares/parseMetadata");

const Photo = require("../models/Photo");
const PhotoHistory = require("../models/PhotoHistory");

const { createValidators, updateValidators } = require("../validators/photos");

const {
  uploadPhotoImage, // multer.single('image') + validaciones MIME/tamaño
  buildPublicUrl, // arma URL pública desde filename y base
  deleteLocalPhotoByUrl, // borra archivo previo (best-effort)
} = require("../utils/upload");

const { shouldCountVisit } = require("../utils/visitRateLimit");

/* ------------------------------- Helpers comunes ------------------------------ */

// Mapea clave de orden del front → sort Mongo
function mapSort(sort) {
  switch (sort) {
    case "oldest":
      return { uploadedDate: 1 };
    case "taken-desc":
      return { takenDate: -1 };
    case "taken-asc":
      return { takenDate: 1 };
    case "relevant":
      return { visits: -1 };
    case "newest":
    default:
      return { uploadedDate: -1 };
  }
}

// Valida ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// Diff simple para historial (compara before vs after solo en claves de 'after')
function buildChangesDiff(before, after) {
  const changed = {};
  for (const k of Object.keys(after)) {
    const prev = before[k];
    const next = after[k];
    const a = Array.isArray(prev)
      ? JSON.stringify(prev)
      : prev?.toString?.() ?? prev;
    const b = Array.isArray(next)
      ? JSON.stringify(next)
      : next?.toString?.() ?? next;
    if (a !== b) changed[k] = { from: before[k], to: after[k] };
  }
  return changed;
}

/* --------------------------------- Router PÚBLICO ----------------------------- */

const publicPhotosRouter = express.Router();

/**
 * GET /api/public/photos
 * - Lista paginada/filtrada/ordenada de fotos visibles.
 */
publicPhotosRouter.get("/", async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 16, 1),
      50
    );
    const sort = mapSort(req.query.sort);
    const filter = { isVisible: true, isArchived: false };

    if (req.query.q && req.query.q.trim()) {
      filter.$text = { $search: req.query.q.trim() };
    }
    if (req.query.tag && req.query.tag.trim()) {
      filter.tags = req.query.tag.trim();
    }
    if (typeof req.query.featured !== "undefined") {
      if (req.query.featured === "true") filter.featured = true;
      if (req.query.featured === "false") filter.featured = false;
    }

    const totalItems = await Photo.countDocuments(filter);
    const items = await Photo.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    console.error("GET /api/public/photos error:", err);
    res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Error al listar fotos" });
  }
});

/**
 * GET /api/public/photos/:id
 * - Devuelve foto si es visible; caso contrario 404 genérico.
 */
publicPhotosRouter.get("/:id", async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id).lean();
    if (!photo || !photo.isVisible) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }
    res.json(photo);
  } catch (err) {
    console.error("GET /api/public/photos/:id error:", err);
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
  }
});

/**
 * POST /api/public/photos/:id/visit
 * - Rate limit por IP+foto.
 * - Incrementa visitas si la foto existe y es visible.
 */
publicPhotosRouter.post("/:id/visit", async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }

    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "0.0.0.0";
    const countThis = shouldCountVisit(ip, id);
    if (!countThis) return res.json({ ok: true, visitsIncremented: false });

    const updated = await Photo.findOneAndUpdate(
      { _id: id, isVisible: true },
      { $inc: { visits: 1 } },
      { new: true, projection: { visits: 1, _id: 1 } }
    ).lean();

    if (!updated) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }
    return res.json({
      ok: true,
      visitsIncremented: true,
      visits: updated.visits,
    });
  } catch (err) {
    console.error("POST /api/public/photos/:id/visit error:", err);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Error al registrar visita" });
  }
});

/* ---------------------------------- Router ADMIN ------------------------------ */

const adminPhotosRouter = express.Router();

/**
 * POST /api/photos
 * - Crea una foto. Requiere auth.
 * - multipart/form-data: image (binario) + metadata (string JSON).
 */
adminPhotosRouter.post(
  "/",
  requireAuth, // verifica token y rol
  uploadPhotoImage, // guarda archivo/valida MIME y tamaño → setea req.file
  parseMetadata, // mete los campos de metadata en req.body
  ...createValidators,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: errors.array()[0].msg,
          details: errors.array(),
        });
      }
      if (!req.file) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Falta la imagen (campo 'image')",
        });
      }

      const baseUrl = process.env.PUBLIC_BASE_URL || "";
      const filename = path.basename(req.file.filename);
      const imageUrl = buildPublicUrl(filename, baseUrl);

      const {
        title,
        subtitle,
        descriptionMd,
        alt,
        location,
        takenDate,
        tags = [],
        featured = false,
        isVisible = false,
      } = req.body;

      const photo = await Photo.create({
        title,
        subtitle,
        descriptionMd,
        alt: alt || title,
        location,
        takenDate: takenDate ? new Date(takenDate) : undefined,
        imageUrl, // se calcula en server
        featured: Boolean(featured),
        isVisible: Boolean(isVisible),
        tags,
        createdBy: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
      });

      await PhotoHistory.create({
        photoId: photo._id,
        action: "create",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: {
          title: photo.title,
          isVisible: photo.isVisible,
          featured: photo.featured,
          tags: photo.tags,
          takenDate: photo.takenDate,
        },
      });

      return res.status(201).json(photo.toJSON());
    } catch (err) {
      console.error("POST /api/photos error:", err);
      if (err?.message?.includes("Tipo de archivo no permitido")) {
        return res
          .status(400)
          .json({ error: "VALIDATION_ERROR", message: err.message });
      }
      if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "PAYLOAD_TOO_LARGE",
          message: "Imagen supera tamaño máximo (15MB)",
        });
      }
      return res
        .status(err.status || 500)
        .json({ error: "INTERNAL_ERROR", message: "No se pudo crear la foto" });
    }
  }
);

/**
 * PUT /api/photos/:id
 * - Edita metadatos y opcionalmente reemplaza imagen. Requiere auth.
 */
adminPhotosRouter.put(
  "/:id",
  requireAuth,
  uploadPhotoImage, // si llega nueva imagen, setea req.file
  parseMetadata,
  ...updateValidators,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: errors.array()[0].msg,
          details: errors.array(),
        });
      }

      const photo = await Photo.findById(req.params.id);
      if (!photo) {
        return res
          .status(404)
          .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
      }

      const {
        title,
        subtitle,
        descriptionMd,
        alt,
        location,
        takenDate,
        tags,
        featured,
        isVisible,
      } = req.body;

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (subtitle !== undefined) updates.subtitle = subtitle;
      if (descriptionMd !== undefined) updates.descriptionMd = descriptionMd;
      if (alt !== undefined) updates.alt = alt;
      if (location !== undefined) updates.location = location;
      if (takenDate !== undefined)
        updates.takenDate = takenDate ? new Date(takenDate) : null;
      if (tags !== undefined) updates.tags = tags;
      if (featured !== undefined) updates.featured = Boolean(featured);
      if (isVisible !== undefined) updates.isVisible = Boolean(isVisible);

      let oldImageUrl = null;
      if (req.file) {
        const baseUrl = process.env.PUBLIC_BASE_URL || "";
        const filename = path.basename(req.file.filename);
        updates.imageUrl = buildPublicUrl(filename, baseUrl);
        oldImageUrl = photo.imageUrl;
      }

      const before = photo.toObject();
      const diff = buildChangesDiff(before, updates);
      if (Object.keys(diff).length === 0) {
        return res.json(photo.toJSON()); // nada cambió
      }

      Object.assign(photo, updates);
      await photo.save();

      if (oldImageUrl) {
        try {
          deleteLocalPhotoByUrl(oldImageUrl);
        } catch (e) {
          console.warn("No se pudo borrar la imagen anterior:", e?.message);
        }
      }

      await PhotoHistory.create({
        photoId: photo._id,
        action: "update",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { changes: diff },
      });

      return res.json(photo.toJSON());
    } catch (err) {
      console.error("PUT /api/photos/:id error:", err);
      if (err?.message?.includes("Tipo de archivo no permitido")) {
        return res
          .status(400)
          .json({ error: "VALIDATION_ERROR", message: err.message });
      }
      if (err?.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "PAYLOAD_TOO_LARGE",
          message: "Imagen supera tamaño máximo (12MB)",
        });
      }
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "No se pudo actualizar la foto",
      });
    }
  }
);

/**
 * PATCH /api/photos/:id/visibility { isVisible: boolean }
 */
adminPhotosRouter.patch(
  "/:id/visibility",
  requireAuth,
  [body("isVisible").isBoolean().withMessage("isVisible debe ser booleano")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", message: errors.array()[0].msg });
    }
    const photo = await Photo.findById(req.params.id);
    if (!photo)
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });

    const before = photo.toObject();
    photo.isVisible = Boolean(req.body.isVisible);
    await photo.save();

    await PhotoHistory.create({
      photoId: photo._id,
      action: "toggle_visibility",
      by: req.user
        ? { id: req.user.id, username: req.user.username }
        : undefined,
      payload: { from: before.isVisible, to: photo.isVisible },
    });

    res.json(photo.toJSON());
  }
);

/**
 * PATCH /api/photos/:id/featured { featured: boolean, order?: number }
 * - order aplica solo si featured=true
 */
adminPhotosRouter.patch(
  "/:id/featured",
  requireAuth,
  [
    body("featured").isBoolean().withMessage("featured debe ser booleano"),
    body("order")
      .optional()
      .isInt({ min: 0 })
      .withMessage("order debe ser entero ≥ 0"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", message: errors.array()[0].msg });
    }
    const photo = await Photo.findById(req.params.id);
    if (!photo)
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });

    const before = photo.toObject();
    photo.featured = Boolean(req.body.featured);
    if (photo.featured && typeof req.body.order === "number") {
      photo.order = req.body.order;
    }
    if (!photo.featured) photo.order = 0;

    await photo.save();

    await PhotoHistory.create({
      photoId: photo._id,
      action: "toggle_featured",
      by: req.user
        ? { id: req.user.id, username: req.user.username }
        : undefined,
      payload: {
        from: { featured: before.featured, order: before.order },
        to: { featured: photo.featured, order: photo.order },
      },
    });

    res.json(photo.toJSON());
  }
);

/**
 * PATCH /api/photos/reorder { items: [{ id, order }] }
 * - Marca featured=true para los reordenados.
 */
adminPhotosRouter.patch(
  "/reorder",
  requireAuth,
  [
    body("items").isArray({ min: 1 }).withMessage("items debe ser un array"),
    body("items.*.id").isString().withMessage("items[i].id inválido"),
    body("items.*.order")
      .isInt({ min: 0 })
      .withMessage("items[i].order inválido"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ error: "VALIDATION_ERROR", message: errors.array()[0].msg });
    }

    const ops = req.body.items.map(({ id, order }) =>
      Photo.updateOne(
        { _id: id },
        { $set: { order: Number(order), featured: true } }
      )
    );
    await Promise.all(ops);

    await PhotoHistory.create({
      photoId: null,
      action: "reorder",
      by: req.user
        ? { id: req.user.id, username: req.user.username }
        : undefined,
      payload: { items: req.body.items },
    });

    res.json({ ok: true });
  }
);

/**
 * GET /api/photos/:id/history
 * - Lista historial de una foto.
 */
adminPhotosRouter.get("/:id/history", requireAuth, async (req, res) => {
  const items = await PhotoHistory.find({ photoId: req.params.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items });
});

module.exports = { adminPhotosRouter, publicPhotosRouter };
