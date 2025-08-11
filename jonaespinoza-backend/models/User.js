// models/User.js
// Función: Esquema de Usuario Admin con campos base y restricciones.
// Nota: Nunca guardamos la password en claro, solo el hash.

const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true, // debe venir en cada creación
      unique: true, // no puede repetirse
      trim: true, // limpia espacios accidentales
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true, // normaliza para evitar duplicados por mayúsculas
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: "admin", // por ahora solo admin
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    versionKey: false, // evita el campo __v
  }
);

// Índices recomendados (refuerza uniqueness a nivel DB)
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
