// routes/public.photos.routes.js
// Rutas públicas de Fotos (sin auth).
// - GET /api/public/photos: lista paginada con orden y filtros
// - GET /api/public/photos/:id: detalle SOLO si la foto es visible
//
// Nota: los nombres de sort están alineados 1:1 con tu chip del front:
// newest, oldest, taken-desc, taken-asc, relevant

const mongoose = require("mongoose");
const express = require("express");
const Photo = require("../models/Photo");
const { shouldCountVisit } = require("../utils/visitRateLimit");

const router = express.Router();

// 🧭 Helper: traduce la clave de sort del front a un objeto de orden para Mongo
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

// Helper: validar ObjectId
function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

// GET /api/public/photos
// Query params:
// - page (default 1), limit (default 16)
// - sort ∈ {newest, oldest, taken-desc, taken-asc, relevant}
// - q (búsqueda por título/subtítulo/ubicación)
// - tag (filtra por un tag)
// - featured (true/false) opcional
router.get("/", async (req, res) => {
  try {
    // 📄 Paginación segura
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 16, 1),
      50
    ); // cap 50 para no matar al server
    const sort = mapSort(req.query.sort);

    // 🔎 Filtros base: solo visibles en público
    const filter = { isVisible: true, isArchived: false };

    // 🔤 Búsqueda simple (usa índice de texto)
    if (req.query.q && req.query.q.trim()) {
      filter.$text = { $search: req.query.q.trim() };
    }

    // 🏷️ Tag
    if (req.query.tag && req.query.tag.trim()) {
      filter.tags = req.query.tag.trim();
    }

    // ⭐ Destacadas
    if (typeof req.query.featured !== "undefined") {
      if (req.query.featured === "true") filter.featured = true;
      if (req.query.featured === "false") filter.featured = false;
    }

    const totalItems = await Photo.countDocuments(filter);
    const items = await Photo.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(); // más liviano para enviar

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

// GET /api/public/photos/:id
// Devuelve 404 si la foto no es visible
router.get("/:id", async (req, res) => {
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
    // Si el id no es ObjectId válido, también devolvemos 404 por seguridad
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
  }
});

// POST /api/public/photos/:id/visit
// - Suma visitas si la foto existe y es visible.
// - Protegido con rate-limit por IP+foto (memoria local).
router.post("/:id/visit", async (req, res) => {
  try {
    const { id } = req.params;

    // 🧾 Validación de id
    if (!isValidObjectId(id)) {
      // No revelamos existencia → 404 genérico
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Foto no encontrada" });
    }

    // 🛡️ Rate-limit por IP (si está dentro de la ventana, no sumamos)
    const ip =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.socket?.remoteAddress ||
      "0.0.0.0";

    const countThis = shouldCountVisit(ip, id);

    // Si no vamos a contar por rate-limit, devolvemos 200 "ok" sin inc
    if (!countThis) {
      return res.json({ ok: true, visitsIncremented: false });
    }

    // ⚙️ Incremento atómico SOLO si isVisible=true
    const updated = await Photo.findOneAndUpdate(
      { _id: id, isVisible: true },
      { $inc: { visits: 1 } },
      { new: true, projection: { visits: 1, _id: 1 } }
    ).lean();

    if (!updated) {
      // No existe o no está visible → 404 genérico
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

module.exports = router;
