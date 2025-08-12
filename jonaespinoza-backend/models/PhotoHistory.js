// models/PhotoHistory.js
// Historial mínimo de acciones sobre fotos.
// - Registramos quién hizo qué y cuándo.
// - Para "create" guardamos un snapshot pequeño de los campos clave.

const mongoose = require("mongoose");

const PhotoHistorySchema = new mongoose.Schema(
  {
    photoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      required: true,
    },
    action: {
      type: String,
      enum: ["create", "update", "visibility", "featured", "reorder", "delete"],
      required: true,
    },
    by: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      username: String,
    },
    // Snapshot o diffs según acción:
    payload: { type: Object }, // flexible: ej. {title, featured, isVisible, ...}
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

PhotoHistorySchema.set("toJSON", {
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("PhotoHistory", PhotoHistorySchema);
