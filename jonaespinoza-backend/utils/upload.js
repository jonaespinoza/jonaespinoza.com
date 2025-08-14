// utils/upload.js
// Middleware de subida de archivos con multer.
// - Centralizamos configuración para poder cambiar a S3/Cloudinary después sin tocar rutas.
// - Valida mimetype, limita tamaño y renombra el archivo con un nombre único.

const path = require("path");
const fs = require("fs");
const multer = require("multer");
const { URL } = require("url");

// 📁 Carpeta destino (creamos si no existe)
const UPLOAD_DIR = path.join(process.cwd(), "uploads", "photos");
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 🎯 Filtro de tipos permitidos
const ALLOWED_MIME = ["image/jpg", "image/jpeg", "image/png", "image/webp"];

// 🧠 Estrategia de almacenamiento en disco local
const storage = multer.diskStorage({
  // directorio final
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  // nombre de archivo único: photo_<timestamp>_<rand>.<ext>
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase(); // incluye el punto
    const unique = `photo_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 8)}${ext}`;
    cb(null, unique);
  },
});

// 🛡️ Filtro de archivo: tipo y tamaño
function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido (usa JPG, PNG o WebP)"));
  }
  cb(null, true);
}

// ⛳ Límite de tamaño: 12MB por archivo
const limits = { fileSize: 15 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

// Exponemos un helper para subir exactamente un campo 'image'
const uploadPhotoImage = upload.single("image");

// 🔁 Helper para construir URL pública del archivo subido
// En dev servimos /uploads estático; en prod podrías reemplazar por CDN/S3.
function buildPublicUrl(filename, baseUrl) {
  // baseUrl = p.ej. process.env.PUBLIC_BASE_URL (http://localhost:4000)
  // fallback: ruta absoluta desde el server (si exponés /uploads de forma estática)
  const base = baseUrl || "";
  return `${base}/uploads/photos/${filename}`;
}

// 🧽 Borra un archivo local de /uploads/photos a partir de la URL pública guardada.
// - Seguro: resuelve basename y solo borra dentro de UPLOAD_DIR.
// - Si en futuro usamos S3/CDN, reemplazamos esta función por el borrado remoto.

function deleteLocalPhotoByUrl(publicUrl) {
  try {
    // Soporta URLs absolutas y relativas (ej. "/uploads/photos/xyz.webp")
    const base = process.env.PUBLIC_BASE_URL || "http://localhost";
    const u = new URL(publicUrl, base);
    const basename = path.basename(u.pathname); // "photo_....ext"
    const full = path.join(UPLOAD_DIR, basename);

    if (!full.startsWith(UPLOAD_DIR)) return false; // safety
    if (fs.existsSync(full)) {
      fs.unlinkSync(full);
      return true;
    }
    return false;
  } catch (_e) {
    return false;
  }
}

module.exports = {
  uploadPhotoImage,
  buildPublicUrl,
  UPLOAD_DIR,
  deleteLocalPhotoByUrl,
};
