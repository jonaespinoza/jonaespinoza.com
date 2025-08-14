// app.js
// Explicación general (en comentarios):
// - Carga variables de entorno y dependencias base.
// - Configura CORS (incluye PUT), logging con morgan y parseo JSON.
// - Expone /uploads como estático (útil para ver imágenes subidas en dev).
// - Monta rutas de auth, públicas de fotos y admin de fotos (protegidas).
// - Agrega un "probe" para depurar entradas a /api/photos.
// - Conecta a Mongo y levanta el servidor.
// - Define un manejador de errores global (captura errores de middlewares como multer).

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

// Rutas
const authRoutes = require("./routes/auth.routes");
// Unificado del módulo Fotos: exporta { adminPhotosRouter, publicPhotosRouter }
const {
  adminPhotosRouter,
  publicPhotosRouter,
} = require("./routes/admin.photos.routes");

// Middleware de auth para el ping protegido
const requireAuth = require("./middlewares/requireAuth");

const app = express();

/* -------------------------------- Middlewares base ------------------------------- */

// Logger de requests (antes de rutas para ver todo el tráfico)
app.use(morgan("dev"));

// CORS: habilitamos origen del front y métodos usados (incluye PUT)
app.use(
  cors({
    origin: ["http://localhost:5173"], // ajustar en prod
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // ← añadimos PUT
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Parseo JSON de requests (no afecta multipart; eso lo maneja multer en las rutas)
app.use(express.json());

// (opcional) si necesitás leer application/x-www-form-urlencoded en otros endpoints
app.use(express.urlencoded({ extended: true }));

// Servir estático /uploads (antes de rutas) para poder ver imágenes subidas en dev
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ----------------------------------- Health ------------------------------------ */

// Ruta simple de salud
app.get("/", (_req, res) => res.send("Backend funcionando!"));

// Ping protegido (temporal, útil para probar tokens)
app.get("/api/protected/ping", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

/* ----------------------------------- Rutas ------------------------------------- */

// Auth
app.use("/api/auth", authRoutes);

// Probe: log mínimo para confirmar que las requests llegan a /api/photos
app.use("/api/photos", (req, _res, next) => {
  // Comentario: esto ayuda a ver Content-Type y path real cuando hay 400 "mudos".
  console.log(
    `> HIT /api/photos ${req.method} ${req.path} ct=${req.headers["content-type"]}`
  );
  next();
});

// Admin (protegido): crear/editar/toggles/reorder/history
app.use("/api/photos", adminPhotosRouter);

// Público: lista/detalle/visitas
app.use("/api/public/photos", publicPhotosRouter);

/* ------------------------------- Conexión Mongo -------------------------------- */

mongoose
  .connect(process.env.MONGO_URI, {
    // Comentario: opciones modernas recomendadas por Mongoose 6+
    // useNewUrlParser / useUnifiedTopology ya no son necesarias, pero no rompen.
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando MongoDB:", err));

/* --------------------------- Manejador global de errores ------------------------ */
// Comentario: captura errores que burbujean desde middlewares de rutas (p. ej. multer).
app.use((err, _req, res, _next) => {
  console.error("GLOBAL ERROR:", err);

  // Tamaño de archivo (multer)
  if (err?.code === "LIMIT_FILE_SIZE") {
    return res.status(413).json({
      error: "PAYLOAD_TOO_LARGE",
      message: "Imagen supera tamaño máximo (12MB)",
    });
  }

  // Errores de fileFilter u otros middlewares
  if (err?.message) {
    return res.status(400).json({
      error: "MIDDLEWARE_ERROR",
      message: err.message,
    });
  }

  return res.status(500).json({
    error: "INTERNAL_ERROR",
    message: "Error inesperado en el servidor",
  });
});

/* ------------------------------ Levantar servidor ------------------------------ */

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en el puerto ${PORT}`);
});

module.exports = app;
