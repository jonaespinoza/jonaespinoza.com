// models/Photo.js
// Modelo Mongoose para las Fotos
// - Define el contrato de datos que usa el front (DTO) y lo alinea a la base.
// - Incluye defaults y un transform para exponer `id` en lugar de `_id`.

const mongoose = require("mongoose");

const PhotoSchema = new mongoose.Schema(
  {
    // 🔤 Títulos y textos
    title: { type: String, required: true, trim: true, maxlength: 120 }, // requerido por UX
    subtitle: { type: String, trim: true, maxlength: 160 },
    descriptionMd: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    }, // Markdown

    // ♿ Accesibilidad
    alt: { type: String, trim: true, maxlength: 160 }, // fallback: title en el front

    // 📍 Metadatos
    location: { type: String, trim: true, maxlength: 120 },
    takenDate: { type: Date }, // solo fecha; validado en front y back

    // 🖼️ Imagen
    imageUrl: { type: String, required: true, trim: true }, // URL absoluta que servirá el front

    // ⭐ Destacadas y orden manual
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 }, // solo se usa si featured=true

    // 👀 Métrica simple
    visits: { type: Number, default: 0, min: 0 },

    // 🏷️ Organización
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) =>
          arr.length <= 10 && arr.every((t) => t.length >= 1 && t.length <= 30),
        message: "Tags inválidos (máx 10, cada uno entre 1 y 30 caracteres).",
      },
    },

    // 🔓 Visibilidad pública
    isVisible: { type: Boolean, default: false },

    // 👤 Auditoría mínima
    createdBy: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: { type: String },
    },

    // 🗓️ Fechas sistema
    uploadedDate: { type: Date, default: Date.now }, // fecha de publicación/carga

    // Archivado
    isArchived: { type: Boolean, default: false }, // soft-delete: excluye de público y del admin por defecto si filtrás
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// 🧹 Transform para entregar `id` y ocultar internos
PhotoSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

// 🔎 Índices útiles (búsqueda simple por título, subtítulo, ubicación y tags)
PhotoSchema.index({
  title: "text",
  subtitle: "text",
  location: "text",
  tags: 1,
});

module.exports = mongoose.model("Photo", PhotoSchema);
