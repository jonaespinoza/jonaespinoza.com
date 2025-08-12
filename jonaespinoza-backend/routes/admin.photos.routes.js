// routes/admin.photos.routes.js
// Rutas ADMIN para gestión de fotos.
// En este micro-paso implementamos SOLO: POST /api/photos (crear).
//
// Flujo:
// 1) requireAuth: verifica JWT y añade req.user (id, username).
// 2) uploadPhotoImage: procesa campo 'image' (multer).
// 3) Parseamos y validamos `metadata` (JSON).
// 4) Creamos Photo en DB y registramos una entrada en PhotoHistory.
// 5) Devolvemos la Photo creada.
//
// Nota: descriptionMd se guarda como Markdown (texto).
//       isVisible y featured son opcionales; por defecto false.

const express = require("express");
const { body, validationResult } = require("express-validator");
const path = require("path");

const requireAuth = require("../middlewares/requireAuth");
const Photo = require("../models/Photo");
const PhotoHistory = require("../models/PhotoHistory");
const { uploadPhotoImage, buildPublicUrl } = require("../utils/upload");

const router = express.Router();

// 🧪 Validadores sobre metadata (se aplican tras parsear JSON)
const metadataValidators = [
  body("title")
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Título inválido"),
  body("descriptionMd")
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Descripción inválida"),
  body("subtitle").optional().isString().trim().isLength({ max: 160 }),
  body("alt").optional().isString().trim().isLength({ max: 160 }),
  body("location").optional().isString().trim().isLength({ max: 120 }),
  body("takenDate")
    .optional()
    .isISO8601()
    .withMessage("takenDate debe ser ISO (YYYY-MM-DD)"),
  body("featured").optional().isBoolean(),
  body("isVisible").optional().isBoolean(),
  body("tags").optional().isArray({ max: 10 }).withMessage("Máximo 10 tags"),
  body("tags.*").optional().isString().trim().isLength({ min: 1, max: 30 }),
];

// Helper: parsea metadata que llega como string JSON en multipart
function parseMetadata(req, _res, next) {
  try {
    if (typeof req.body.metadata === "string") {
      const parsed = JSON.parse(req.body.metadata);
      // movemos a req.body plano para que express-validator pueda leerlo
      Object.assign(req.body, parsed);
      delete req.body.metadata;
    }
    next();
  } catch (err) {
    next(
      Object.assign(new Error("metadata debe ser JSON válido"), { status: 400 })
    );
  }
}

// POST /api/photos
// Crea una foto nueva.
// Campos esperados (multipart/form-data):
//   - image: archivo de imagen (jpg/png/webp), requerido
//   - metadata: string JSON con campos de la Photo (title, descriptionMd, etc.)
router.post(
  "/",
  requireAuth, // 1) Solo admin logueado
  uploadPhotoImage, // 2) Procesa 'image'
  parseMetadata, // 3) Convierte metadata JSON → req.body
  metadataValidators, // 4) Valida campos
  async (req, res) => {
    try {
      // 4.1) Errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: errors.array()[0].msg,
          details: errors.array(),
        });
      }

      // 2.1) Verificar que llegó el archivo
      if (!req.file) {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Falta la imagen (campo 'image')",
        });
      }

      // 5) Construimos la URL pública del archivo
      // Si tenés PUBLIC_BASE_URL, usala; en dev, exponiendo /uploads, alcanza con path relativo.
      const baseUrl = process.env.PUBLIC_BASE_URL || "";
      const filename = path.basename(req.file.filename);
      const imageUrl = buildPublicUrl(filename, baseUrl);

      // 6) Extraemos campos de req.body validados
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

      // 7) Creamos el documento Photo
      const photo = await Photo.create({
        title,
        subtitle,
        descriptionMd,
        alt: alt || title, // fallback accesible
        location,
        takenDate: takenDate ? new Date(takenDate) : undefined,
        imageUrl,
        featured: Boolean(featured),
        isVisible: Boolean(isVisible),
        tags,
        createdBy: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        // uploadedDate se setea por default, visits=0, order=0
      });

      // 8) Registramos historial "create"
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

      // 9) Devolvemos la foto creada
      return res.status(201).json(photo.toJSON());
    } catch (err) {
      console.error("POST /api/photos error:", err);

      // Error estándar para tipos no permitidos o tamaño (multer)
      if (
        err instanceof Error &&
        err.message?.includes("Tipo de archivo no permitido")
      ) {
        return res
          .status(400)
          .json({ error: "VALIDATION_ERROR", message: err.message });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          error: "PAYLOAD_TOO_LARGE",
          message: "Imagen supera tamaño máximo (12MB)",
        });
      }

      const status = err.status || 500;
      return res
        .status(status)
        .json({ error: "INTERNAL_ERROR", message: "No se pudo crear la foto" });
    }
  }
);

// 🧪 Validadores para PUT: todos opcionales pero, si vienen, deben ser válidos.
const updateValidators = [
  body("title")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("Título inválido"),
  body("descriptionMd")
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("Descripción inválida"),
  body("subtitle").optional().isString().trim().isLength({ max: 160 }),
  body("alt").optional().isString().trim().isLength({ max: 160 }),
  body("location").optional().isString().trim().isLength({ max: 120 }),
  body("takenDate")
    .optional()
    .isISO8601()
    .withMessage("takenDate debe ser ISO (YYYY-MM-DD)"),
  body("featured").optional().isBoolean(),
  body("isVisible").optional().isBoolean(),
  body("tags").optional().isArray({ max: 10 }).withMessage("Máximo 10 tags"),
  body("tags.*").optional().isString().trim().isLength({ min: 1, max: 30 }),
];

// 🔍 util para armar un diff simple campo a campo
function buildChangesDiff(before, after) {
  const changed = {};
  for (const k of Object.keys(after)) {
    const prev = before[k];
    const next = after[k];
    // Comparación simple; para arrays usamos stringify liviano
    const a = Array.isArray(prev)
      ? JSON.stringify(prev)
      : prev?.toString?.() ?? prev;
    const b = Array.isArray(next)
      ? JSON.stringify(next)
      : next?.toString?.() ?? next;
    if (a !== b) {
      changed[k] = { from: before[k], to: after[k] };
    }
  }
  return changed;
}

// PUT /api/photos/:id
// - Edita metadatos y, opcionalmente, reemplaza imagen.
// - Acepta JSON (solo metadatos) o multipart/form-data (image + metadata).
router.put(
  "/:id",
  requireAuth, // solo admin
  uploadPhotoImage, // procesa 'image' si el Content-Type es multipart
  parseMetadata, // si viene 'metadata' como string JSON, lo parsea
  updateValidators, // valida solo lo que llegó
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

      // 1) Buscamos la foto
      const photo = await Photo.findById(req.params.id);
      if (!photo) {
        return res
          .status(404)
          .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
      }

      // 2) Preparamos 'updates' con los campos que vinieron
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
      if (typeof title !== "undefined") updates.title = title;
      if (typeof subtitle !== "undefined") updates.subtitle = subtitle;
      if (typeof descriptionMd !== "undefined")
        updates.descriptionMd = descriptionMd;
      if (typeof alt !== "undefined") updates.alt = alt;
      if (typeof location !== "undefined") updates.location = location;
      if (typeof takenDate !== "undefined")
        updates.takenDate = takenDate ? new Date(takenDate) : null;
      if (typeof tags !== "undefined") updates.tags = tags;
      if (typeof featured !== "undefined") updates.featured = Boolean(featured);
      if (typeof isVisible !== "undefined")
        updates.isVisible = Boolean(isVisible);

      // 3) Si llegó nueva imagen, construimos nueva URL y guardamos la anterior para borrarla luego
      let oldImageUrl = null;
      if (req.file) {
        const baseUrl = process.env.PUBLIC_BASE_URL || "";
        const filename = path.basename(req.file.filename);
        const newUrl = buildPublicUrl(filename, baseUrl);
        oldImageUrl = photo.imageUrl; // guardar para limpiar después
        updates.imageUrl = newUrl;
      }

      // 4) Calculamos diff antes de mutar el doc (para historial)
      const before = photo.toObject();
      const diff = buildChangesDiff(before, updates);

      // Si no hay cambios, devolver tal cual (evitamos historial vacío)
      if (Object.keys(diff).length === 0) {
        return res.json(photo.toJSON());
      }

      // 5) Aplicamos cambios y guardamos
      Object.assign(photo, updates);
      await photo.save();

      // 6) Si cambiamos imagen, borramos la anterior del disco (best-effort)
      if (oldImageUrl) {
        try {
          const { deleteLocalPhotoByUrl } = require("../utils/upload");
          deleteLocalPhotoByUrl(oldImageUrl);
        } catch (e) {
          console.warn("No se pudo borrar la imagen anterior:", e?.message);
        }
      }

      // 7) Historial "update"
      await PhotoHistory.create({
        photoId: photo._id,
        action: "update",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { changes: diff },
      });

      // 8) Respuesta
      return res.json(photo.toJSON());
    } catch (err) {
      console.error("PUT /api/photos/:id error:", err);

      // Errores de multer
      if (
        err instanceof Error &&
        err.message?.includes("Tipo de archivo no permitido")
      ) {
        return res
          .status(400)
          .json({ error: "VALIDATION_ERROR", message: err.message });
      }
      if (err.code === "LIMIT_FILE_SIZE") {
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

// Toggle de visibilidad de una foto
// - PATCH /api/photos/:id/visibility
// - Body: { isVisible: boolean }
// - Protegido por requireAuth
router.patch(
  "/:id/visibility",
  requireAuth,
  [
    // Validamos que venga un booleano
    body("isVisible").isBoolean().withMessage("isVisible debe ser boolean"),
  ],
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

      const { isVisible } = req.body;

      // Buscamos la foto
      const photo = await Photo.findById(req.params.id);
      if (!photo) {
        return res
          .status(404)
          .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
      }

      // Si no cambia, devolvemos tal cual (evitamos historial vacío)
      if (photo.isVisible === Boolean(isVisible)) {
        return res.json(photo.toJSON());
      }

      const before = photo.isVisible;
      photo.isVisible = Boolean(isVisible);
      await photo.save();

      // Historial del toggle
      await PhotoHistory.create({
        photoId: photo._id,
        action: "visibility",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { from: before, to: photo.isVisible },
      });

      return res.json(photo.toJSON());
    } catch (err) {
      console.error("PATCH /api/photos/:id/visibility error:", err);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "No se pudo actualizar la visibilidad",
      });
    }
  }
);

// PATCH /api/photos/:id/featured
// - Body: { featured: boolean }
// - Cambia el flag y registra historial.
// - Si la marcamos como featured=true y no tenía orden, la empujamos al final (mayor order+1).
router.patch(
  "/:id/featured",
  requireAuth,
  [body("featured").isBoolean().withMessage("featured debe ser boolean")],
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

      const { featured } = req.body;
      const photo = await Photo.findById(req.params.id);
      if (!photo)
        return res
          .status(404)
          .json({ error: "NOT_FOUND", message: "Foto no encontrada" });

      if (photo.featured === Boolean(featured)) {
        return res.json(photo.toJSON()); // sin cambio → sin historial
      }

      const before = photo.featured;
      photo.featured = Boolean(featured);

      // Si la marcamos como destacada y su order es 0, la empujamos al final
      if (photo.featured) {
        const last = await Photo.find({ featured: true })
          .sort({ order: -1 })
          .limit(1)
          .lean();
        const lastOrder = last?.[0]?.order ?? 0;
        if (!photo.order || photo.order <= 0) photo.order = lastOrder + 1;
      } else {
        // Al des‑destacar podemos resetear order a 0 (queda fuera del carrusel de destacadas)
        photo.order = 0;
      }

      await photo.save();

      await PhotoHistory.create({
        photoId: photo._id,
        action: "featured",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { from: before, to: photo.featured },
      });

      return res.json(photo.toJSON());
    } catch (err) {
      console.error("PATCH /api/photos/:id/featured error:", err);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "No se pudo actualizar featured",
      });
    }
  }
);

// GET /api/photos/:id/history
// - Lista de entradas de historial (ordenadas desc), con paginación simple.
router.get("/:id/history", requireAuth, async (req, res) => {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );

    // Opcional: validar existencia de la foto (barato con projection mínima)
    const exists = await Photo.exists({ _id: req.params.id });
    if (!exists)
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });

    const [items, totalItems] = await Promise.all([
      PhotoHistory.find({ photoId: req.params.id })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      PhotoHistory.countDocuments({ photoId: req.params.id }),
    ]);

    return res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    console.error("GET /api/photos/:id/history error:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "No se pudo obtener el historial",
    });
  }
});

// PATCH /api/photos/reorder
// - Body: [{ id: string, order: number }, ...]
// - Solo aplica a fotos featured=true.
// - Idempotente: actualiza únicamente las que realmente cambian.
router.patch("/reorder", requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body) ? req.body : [];
    if (items.length === 0) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        message: "Body debe ser un array con {id, order}",
      });
    }

    // Validación mínima
    for (const it of items) {
      if (!it?.id || typeof it.order !== "number") {
        return res.status(400).json({
          error: "VALIDATION_ERROR",
          message: "Cada item requiere id y order numérico",
        });
      }
    }

    // Leemos fotos actuales (solo featured) para construir diffs y validar
    const ids = items.map((i) => i.id);
    const photos = await Photo.find({ _id: { $in: ids }, featured: true })
      .select("_id order")
      .lean();

    const byId = new Map(photos.map((p) => [p._id.toString(), p]));
    const bulk = [];

    for (const { id, order } of items) {
      const p = byId.get(id);
      if (!p) continue; // ignoramos ids no featured (o inexistentes)
      if (p.order !== order) {
        bulk.push({
          updateOne: { filter: { _id: id }, update: { $set: { order } } },
        });
      }
    }

    if (bulk.length > 0) {
      await Photo.bulkWrite(bulk);
      // Historial general: guardamos la lista de órdenes aplicada
      await PhotoHistory.create({
        photoId: null, // opcional: sin foto puntual, es una acción masiva
        action: "reorder",
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { changes: items },
      });
    }

    return res.json({ ok: true, updated: bulk.length });
  } catch (err) {
    console.error("PATCH /api/photos/reorder error:", err);
    return res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "No se pudo reordenar" });
  }
});

// Listado ADMIN de fotos con filtros y paginación.
// GET /api/photos?page=1&limit=16&sort=newest&q=...&tag=...&featured=true&isVisible=false&isArchived=false
router.get("/", requireAuth, async (req, res) => {
  try {
    // Paginación segura
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 16, 1),
      100
    );

    // Mapea sort como en público/chip
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
    const sort = mapSort(req.query.sort);

    // Filtros (admin ve todo, salvo que se filtren)
    const filter = {};

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
    if (typeof req.query.isVisible !== "undefined") {
      if (req.query.isVisible === "true") filter.isVisible = true;
      if (req.query.isVisible === "false") filter.isVisible = false;
    }
    if (typeof req.query.isArchived !== "undefined") {
      if (req.query.isArchived === "true") filter.isArchived = true;
      if (req.query.isArchived === "false") filter.isArchived = false;
    }

    const totalItems = await Photo.countDocuments(filter);
    const items = await Photo.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return res.json({
      items,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    });
  } catch (err) {
    console.error("GET /api/photos (admin) error:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "Error al listar fotos (admin)",
    });
  }
});

// Soft-delete (archivar) una foto.
// DELETE /api/photos/:id
// - Marca isArchived=true y isVisible=false
// - No borra imagen ni documento (reversible)
// - Historial "delete" con payload { archived: true }
router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }

    // Si ya está archivada, devolvemos tal cual
    if (photo.isArchived) {
      return res.json(photo.toJSON());
    }

    photo.isArchived = true;
    photo.isVisible = false; // aseguramos que no sea pública
    await photo.save();

    await PhotoHistory.create({
      photoId: photo._id,
      action: "delete",
      by: req.user
        ? { id: req.user.id, username: req.user.username }
        : undefined,
      payload: { archived: true },
    });

    return res.json(photo.toJSON());
  } catch (err) {
    console.error("DELETE /api/photos/:id error:", err);
    return res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "No se pudo archivar la foto",
    });
  }
});

// PATCH /api/photos/:id/archive
// - Body: { isArchived: boolean }
// - true  -> archiva y oculta (isVisible=false)
// - false -> desarchiva (no cambia isVisible: queda como esté)
// - Historial: action "delete" con payload { archived: <bool> }
router.patch(
  "/:id/archive",
  requireAuth,
  [body("isArchived").isBoolean().withMessage("isArchived debe ser boolean")],
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

      const { isArchived } = req.body;
      const photo = await Photo.findById(req.params.id);
      if (!photo) {
        return res
          .status(404)
          .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
      }

      // Si no hay cambio real, devolvemos tal cual (evita historial vacío)
      if (photo.isArchived === Boolean(isArchived)) {
        return res.json(photo.toJSON());
      }

      photo.isArchived = Boolean(isArchived);
      if (photo.isArchived) {
        // Al archivar, aseguramos que no sea pública
        photo.isVisible = false;
      }
      await photo.save();

      await PhotoHistory.create({
        photoId: photo._id,
        action: "delete", // reutilizamos esta acción para archivar/desarchivar
        by: req.user
          ? { id: req.user.id, username: req.user.username }
          : undefined,
        payload: { archived: photo.isArchived },
      });

      return res.json(photo.toJSON());
    } catch (err) {
      console.error("PATCH /api/photos/:id/archive error:", err);
      return res.status(500).json({
        error: "INTERNAL_ERROR",
        message: "No se pudo actualizar el archivo lógico",
      });
    }
  }
);

module.exports = router;
