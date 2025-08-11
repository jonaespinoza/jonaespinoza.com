// models/Photo.js
// Función: define el esquema de Foto y sus índices para búsquedas/orden.
// Explicación:
// - Guardamos metadatos completos (title, location, fechas, tags, etc).
// - Índices para queries comunes (featured, tags, order, uploadedDate).
// - Índice de texto para búsquedas por 'q' (title/description).

const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Título visible
    subtitle: { type: String }, // Subtítulo breve
    description: { type: String }, // Texto largo/anécdota
    location: { type: String }, // Lugar de la toma
    takenDate: { type: Date }, // Fecha de la foto
    uploadedDate: { type: Date, default: Date.now }, // Fecha de subida
    imageUrl: { type: String, required: true }, // URL de imagen (cloud o local)
    featured: { type: Boolean, default: false }, // Destacada en carrusel/portada
    visits: { type: Number, default: 0 }, // Contador de visitas
    order: { type: Number }, // Orden manual (opcional)
    tags: [{ type: String }], // Categorías/etiquetas
    isVisible: { type: Boolean, default: true }, // Ocultar sin borrar
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin autor
  },
  {
    versionKey: false,
  }
);

// Índices para rendimiento en listados/filtros comunes
photoSchema.index({ featured: 1 });
photoSchema.index({ isVisible: 1 });
photoSchema.index({ uploadedDate: -1 });
photoSchema.index({ order: 1, uploadedDate: -1 }); // orden custom → luego por fecha
photoSchema.index({ tags: 1 });
// Índice de texto para búsqueda simple (q)
photoSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Photo", photoSchema);
