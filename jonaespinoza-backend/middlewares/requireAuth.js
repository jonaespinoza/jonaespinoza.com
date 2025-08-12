// middlewares/requireAuth.js
// Función: verifica token JWT y adjunta payload a req.user.

const jwt = require("jsonwebtoken");

module.exports = function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [, token] = header.split(" ");

  if (!token) return res.status(401).json({ message: "Token faltante" });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // Normalizamos el shape que usa el backend de Fotos:
    req.user = {
      id: payload.id,
      username: payload.username,
      role: payload.role || "admin",
    };
    return next();
  } catch {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
};
