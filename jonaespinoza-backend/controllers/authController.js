// controllers/authController.js
// Función: maneja login de admin. Verifica password con argon2 y devuelve JWT.

const { body, validationResult } = require("express-validator");
const argon2 = require("argon2"); // ← usamos argon2 para verificar
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Reglas de validación del request
exports.validateLogin = [
  body("email").isEmail().withMessage("Email inválido"),
  body("password")
    .isString()
    .isLength({ min: 6 })
    .withMessage("Password inválida"),
];

exports.login = async (req, res) => {
  // 1) Validación de input
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  const { email, password } = req.body;

  // 2) Buscar usuario por email normalizado
  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) return res.status(401).json({ message: "Credenciales inválidas" });

  // 3) Verificar contraseña con argon2
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

  // 4) Emitir JWT con expiración de 24 horas
  const token = jwt.sign(
    { userId: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  // 5) Actualizar lastLogin asincrónicamente (no bloquea la respuesta)
  user.lastLogin = new Date();
  user.save().catch(() => {});

  // 6) Devolver token + datos mínimos del usuario
  res.json({
    token,
    user: {
      id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role,
    },
  });
};
