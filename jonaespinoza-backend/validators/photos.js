// validators/photos.js
// Reglas de validación/sanitización para el DTO de Photo.
// createValidators: title/descriptionMd obligatorios.
// updateValidators: los mismos campos pero opcionales (para edición).

const { body } = require("express-validator");

// Sanitizador común de tags: acepta array o string "a, b, c"
const tagsSanitizer = body("tags")
  .optional()
  .customSanitizer((v) => {
    if (Array.isArray(v)) {
      return v.map((t) => String(t).trim()).filter(Boolean);
    }
    if (typeof v === "string") {
      return v
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  })
  .isArray({ max: 10 })
  .withMessage("tags: máximo 10");

const tagsItemsRule = body("tags.*")
  .optional()
  .isString()
  .isLength({ max: 30 })
  .withMessage("cada tag hasta 30 chars");

// Campos compartidos (opcionales por defecto)
const optionalShared = [
  body("subtitle").optional().isString().trim().isLength({ max: 160 }),
  body("alt").optional().isString().trim().isLength({ max: 160 }),
  body("location").optional().isString().trim().isLength({ max: 120 }),
  body("takenDate")
    .optional({ nullable: true })
    .isISO8601()
    .withMessage("takenDate debe ser ISO (YYYY-MM-DD o completa)"),
  tagsSanitizer,
  tagsItemsRule,
  body("featured").optional().toBoolean(),
  body("isVisible").optional().toBoolean(),
  // order solo tiene sentido si featured=true (se controla a nivel de endpoint featured)
  body("order")
    .optional()
    .isInt({ min: 0 })
    .withMessage("order debe ser entero ≥ 0"),
];

// Para crear: title y descriptionMd son requeridos
const createOnly = [
  body("title")
    .isString()
    .withMessage("title inválido")
    .trim()
    .notEmpty()
    .withMessage("title requerido")
    .isLength({ min: 1, max: 120 })
    .withMessage("title: 1-120 chars"),
  body("descriptionMd")
    .isString()
    .withMessage("descriptionMd inválido")
    .trim()
    .notEmpty()
    .withMessage("descriptionMd requerido")
    .isLength({ min: 1, max: 10000 })
    .withMessage("descriptionMd: 1-10000 chars"),
];

// Para editar: title y descriptionMd pasan a opcionales (si vienen, se validan)
const updateOnly = [
  body("title")
    .optional()
    .isString()
    .withMessage("title inválido")
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage("title: 1-120 chars"),
  body("descriptionMd")
    .optional()
    .isString()
    .withMessage("descriptionMd inválido")
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage("descriptionMd: 1-10000 chars"),
];

const createValidators = [...createOnly, ...optionalShared];
const updateValidators = [...updateOnly, ...optionalShared];

// Compat: si ya usabas metadataValidators como base para creación
exports.metadataValidators = createValidators;
exports.createValidators = createValidators;
exports.updateValidators = updateValidators;
