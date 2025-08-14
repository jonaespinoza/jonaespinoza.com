// routes/photos.routes.js
// Función: define endpoints públicos y protegidos para Fotos.
// Notas:
// - Crear/editar/borrar requieren JWT (requireAuth).
// - Listar/detalle/visitas son públicos.

const express = require("express");
const router = express.Router();
const requireAuth = require("../middlewares/requireAuth");
const ctrl = require("../controllers/photosController");

// Listar (público, con filtros/paginación)
router.get("/", ctrl.validateList, ctrl.list);

// Detalle (público)
router.get("/:id", ctrl.validateId, ctrl.detail);

// Update parcial (protegido)
router.patch("/:id", requireAuth, ctrl.validateUpdate, ctrl.update);

// Borrar (protegido)
router.delete("/:id", requireAuth, ctrl.validateId, ctrl.remove);

// Sumar visita (público)
router.post("/:id/visit", ctrl.validateId, ctrl.sumVisit);

module.exports = router;
