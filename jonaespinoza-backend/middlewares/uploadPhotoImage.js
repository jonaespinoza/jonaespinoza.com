// middlewares/uploadPhotoImage.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `photo_${Date.now()}${ext}`;
    cb(null, name);
  },
});

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
function fileFilter(_req, file, cb) {
  if (!ACCEPTED.includes(file.mimetype)) {
    return cb(new Error("Tipo de archivo no permitido (jpg/png/webp)"));
  }
  cb(null, true);
}

module.exports = multer({
  storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB
}).single("image"); // <— nombre del campo
