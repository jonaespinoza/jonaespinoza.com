// app.js (tal cual, con un micro-ajuste recomendado de orden de morgan)

require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const authRoutes = require("./routes/auth.routes");

const photosRoutes = require("./routes/photos.routes");
const publicPhotosRoutes = require("./routes/public.photos.routes");
const adminPhotosRoutes = require("./routes/admin.photos.routes");

const app = express();

// Parseo JSON
app.use(express.json());

// CORS (ajusta dominios en producción)
app.use(
  cors({
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false,
  })
);

// Logger antes de las rutas
app.use(morgan("dev"));

// Conexión Mongo
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error conectando MongoDB:", err));

// Ruta de prueba
app.get("/", (req, res) => res.send("Backend funcionando!"));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/photos", photosRoutes);

// Rutas públicas de fotos
app.use("/api/public/photos", publicPhotosRoutes);

// TEST protegido (temporal)
const requireAuth = require("./middlewares/requireAuth");
app.get("/api/protected/ping", requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

// Levantar servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`Servidor backend escuchando en el puerto ${PORT}`)
);

// Sirve estático la carpeta uploads en dev (para ver las imágenes subidas)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rutas ADMIN (protegidas por requireAuth dentro del router)
app.use("/api/photos", adminPhotosRoutes);
