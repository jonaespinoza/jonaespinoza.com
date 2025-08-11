// controllers/photosController.js
// Función: lógica de creación, listado, detalle, actualización, borrado y visitas.
// Notas de diseño:
// - Validamos inputs con express-validator.
// - Listado con filtros (featured, tags, isVisible, fechas), búsqueda 'q',
//   paginación (page, limit) y orden (sortBy, sortDir).
// - 'sumVisit' para incrementar visitas sin bloquear el GET.

const { body, param, query, validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Photo = require("../models/Photo");

// ---------- Validaciones ----------

// Crear
exports.validateCreate = [
  body("title").isString().trim().notEmpty().withMessage("title requerido"),
  body("imageUrl")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("imageUrl requerido"),
  body("subtitle").optional().isString(),
  body("description").optional().isString(),
  body("location").optional().isString(),
  body("takenDate").optional().isISO8601().toDate(),
  body("featured").optional().isBoolean(),
  body("visits").optional().isInt({ min: 0 }),
  body("order").optional().isInt(),
  body("tags").optional().isArray(),
  body("isVisible").optional().isBoolean(),
];

// Update
exports.validateUpdate = [
  param("id")
    .custom((v) => mongoose.isValidObjectId(v))
    .withMessage("id inválido"),
  body("title").optional().isString().trim().notEmpty(),
  body("imageUrl").optional().isString().trim().notEmpty(),
  body("subtitle").optional().isString(),
  body("description").optional().isString(),
  body("location").optional().isString(),
  body("takenDate").optional().isISO8601().toDate(),
  body("featured").optional().isBoolean(),
  body("visits").optional().isInt({ min: 0 }),
  body("order").optional().isInt(),
  body("tags").optional().isArray(),
  body("isVisible").optional().isBoolean(),
];

// Listado / filtros
exports.validateList = [
  query("page").optional().isInt({ min: 1 }).toInt(),
  query("limit").optional().isInt({ min: 1, max: 100 }).toInt(),
  query("featured").optional().isBoolean().toBoolean(),
  query("isVisible").optional().isBoolean().toBoolean(),
  query("tag").optional().isString(),
  query("q").optional().isString().trim(),
  query("takenFrom").optional().isISO8601().toDate(),
  query("takenTo").optional().isISO8601().toDate(),
  query("sortBy")
    .optional()
    .isIn(["uploadedDate", "takenDate", "order", "visits"]),
  query("sortDir").optional().isIn(["asc", "desc"]),
];

// Detalle y visitas
exports.validateId = [
  param("id")
    .custom((v) => mongoose.isValidObjectId(v))
    .withMessage("id inválido"),
];

// ---------- Controladores ----------

// Crear foto (protegido)
exports.create = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // 2) Datos
  const payload = {
    title: req.body.title,
    subtitle: req.body.subtitle,
    description: req.body.description,
    location: req.body.location,
    takenDate: req.body.takenDate,
    // uploadedDate se setea por default
    imageUrl: req.body.imageUrl,
    featured: req.body.featured,
    visits: req.body.visits,
    order: req.body.order,
    tags: req.body.tags,
    isVisible: req.body.isVisible,
    createdBy: req.user?.userId, // tomado del JWT por requireAuth
  };

  // 3) Crear
  const created = await Photo.create(payload);
  return res.status(201).json(created);
};

// Listar fotos (público con filtros/paginación)
exports.list = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // 2) Paginación y orden
  const page = req.query.page || 1;
  const limit = req.query.limit || 12;
  const skip = (page - 1) * limit;

  const sortBy = req.query.sortBy || "uploadedDate";
  const sortDir = req.query.sortDir === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortDir };

  // 3) Filtros
  const filter = {};
  if (typeof req.query.featured === "boolean")
    filter.featured = req.query.featured;
  if (typeof req.query.isVisible === "boolean")
    filter.isVisible = req.query.isVisible;
  if (req.query.tag) filter.tags = req.query.tag;

  if (req.query.takenFrom || req.query.takenTo) {
    filter.takenDate = {};
    if (req.query.takenFrom) filter.takenDate.$gte = req.query.takenFrom;
    if (req.query.takenTo) filter.takenDate.$lte = req.query.takenTo;
  }

  // 4) Búsqueda por texto simple
  if (req.query.q) {
    filter.$text = { $search: req.query.q };
  }

  // 5) Query y conteo
  const [items, total] = await Promise.all([
    Photo.find(filter).sort(sort).skip(skip).limit(limit),
    Photo.countDocuments(filter),
  ]);

  return res.json({
    items,
    page,
    limit,
    total,
    hasNext: skip + items.length < total,
    hasPrev: page > 1,
  });
};

// Detalle de foto (público)
exports.detail = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // 2) Buscar
  const photo = await Photo.findById(req.params.id);
  if (!photo) return res.status(404).json({ message: "Foto no encontrada" });

  return res.json(photo);
};

// Update parcial (protegido)
exports.update = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // 2) Actualizar con $set solo de campos presentes
  const updatable = [
    "title",
    "subtitle",
    "description",
    "location",
    "takenDate",
    "imageUrl",
    "featured",
    "visits",
    "order",
    "tags",
    "isVisible",
  ];
  const $set = {};
  updatable.forEach((k) => {
    if (typeof req.body[k] !== "undefined") $set[k] = req.body[k];
  });

  const updated = await Photo.findByIdAndUpdate(
    req.params.id,
    { $set },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Foto no encontrada" });
  return res.json(updated);
};

// Borrar (protegido)
exports.remove = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const deleted = await Photo.findByIdAndDelete(req.params.id);
  if (!deleted) return res.status(404).json({ message: "Foto no encontrada" });
  return res.status(204).send(); // sin contenido
};

// Sumar visita (público)
exports.sumVisit = async (req, res) => {
  // 1) Validación
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  // 2) Incrementar contador de forma atómica
  const updated = await Photo.findByIdAndUpdate(
    req.params.id,
    { $inc: { visits: 1 } },
    { new: true }
  );
  if (!updated) return res.status(404).json({ message: "Foto no encontrada" });
  return res.json({ visits: updated.visits });
};
