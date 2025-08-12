// routes/admin.photos.routes.js
// Rutas ADMIN del módulo Fotos: crear, editar, toggles, reorder y ver historial.

const express = require("express");
const { validationResult, body } = require("express-validator");
const path = require("path");

const requireAuth = require("../middlewares/requireAuth");
const uploadPhotoImage = require("../middlewares/uploadPhotoImage");
const parseMetadata = require("../middlewares/parseMetadata");

const Photo = require("../models/Photo");
const PhotoHistory = require("../models/PhotoHistory");

// ✅ Usamos los validators centralizados
const { createValidators, updateValidators } = require("../validators/photos");

// Utilidades de archivos/imágenes
const { buildPublicUrl, deleteLocalPhotoByUrl } = require("../utils/upload");

const router = express.Router();

/* ------------------------------ helpers comunes ------------------------------ */

// Diff simple para el historial (compara before vs. after)
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

// DEBUG: logueo previo a validación (quitar luego)
function debugBody(label) {
  return (req, _res, next) => {
    console.log(`[${label}] req.body:`, req.body);
    console.log(
      `[${label}] req.file:`,
      !!req.file,
      req.file?.mimetype,
      req.file?.size
    );
    next();
  };
}

/* ------------------------------------ POST ----------------------------------- */
// POST /api/photos (multipart/form-data)
// - image (obligatoria)
// - metadata (string JSON) con title, descriptionMd, etc. (parseado por parseMetadata)
router.post(
  "/",
  requireAuth,
  uploadPhotoImage, // debe setear req.file si subiste imagen
  parseMetadata, // parsea req.body.metadata si viene como string JSON
  debugBody("POST /api/photos"), // ← DEBUG
  ...createValidators, // valida campos requeridos en creación
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

      // Armamos la URL pública de la imagen (ajustá según tu storage)
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
        imageUrl,
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
          message: "Imagen supera tamaño máximo (12MB)",
        });
      }
      return res
        .status(err.status || 500)
        .json({ error: "INTERNAL_ERROR", message: "No se pudo crear la foto" });
    }
  }
);

/* ------------------------------------- PUT ----------------------------------- */
// PUT /api/photos/:id
// Acepta JSON (solo metadatos) o multipart (image + metadata)
// ⚠️ updateValidators es un ARRAY: se debe expandir con ...
router.put(
  "/:id",
  requireAuth,
  uploadPhotoImage,
  parseMetadata,
  debugBody("POST /api/photos"), // ← DEBUG
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

      // Solo asignamos campos presentes
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

      // Reemplazo de imagen (opcional)
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
        // Nada cambió: devolvemos el actual
        return res.json(photo.toJSON());
      }

      Object.assign(photo, updates);
      await photo.save();

      if (oldImageUrl) {
        // Intento best-effort de borrar la imagen anterior del storage local
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

/* ------------------------------- PATCH toggles ------------------------------- */
// PATCH /api/photos/:id/visibility  { isVisible: boolean }
router.patch(
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
    if (!photo) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }

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

// PATCH /api/photos/:id/featured  { featured: boolean, order?: number }
// (order es significativo solo si featured=true)
router.patch(
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
    if (!photo) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }

    const before = photo.toObject();
    photo.featured = Boolean(req.body.featured);
    if (photo.featured && typeof req.body.order === "number") {
      photo.order = req.body.order;
    }
    if (!photo.featured) {
      photo.order = 0;
    }
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

/* --------------------------------- reorder ---------------------------------- */
// PATCH /api/photos/reorder  { items: Array<{ id: string, order: number }> }
router.patch(
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

/* --------------------------------- history ---------------------------------- */
// GET /api/photos/:id/history
router.get("/:id/history", requireAuth, async (req, res) => {
  const items = await PhotoHistory.find({ photoId: req.params.id })
    .sort({ createdAt: -1 })
    .lean();
  res.json({ items });
});

module.exports = router;
