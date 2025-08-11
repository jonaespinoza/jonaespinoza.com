// routes/auth.routes.js
// Explicación:
// - Endpoint de autenticación con reCAPTCHA v2 "No soy un robot" (checkbox).
// - Flujo: valida captcha → busca usuario por username/email → verifica pass (argon2) → firma JWT.
// - En v2 NO hay "score" ni "action"; sólo checamos "success" (y opcional "hostname" en dev).

const express = require("express");
const { body, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const argon2 = require("argon2");
const User = require("../models/User");

// ⬇️ Utilidad para v2 checkbox (siteverify)
const { verifyRecaptchaV2 } = require("../utils/recaptchaV2");

const requireAuth = require("../middlewares/requireAuth");

const router = express.Router();

// POST /api/auth/login
// - Valida reCAPTCHA v2 checkbox (siteverify)
// - Busca usuario por username o email
// - Verifica contraseña con argon2
// - Firma JWT y devuelve { token, user }
router.post(
  "/login",
  [
    // Validaciones mínimas de payload
    body("identifier").trim().notEmpty().withMessage("Falta usuario o email"),
    body("password").notEmpty().withMessage("Falta contraseña"),
  ],
  async (req, res) => {
    try {
      // 0) Errores de validación de inputs
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array()[0].msg });
      }

      const { identifier, password, captchaToken } = req.body;

      // Log útil para depurar (podés comentar en prod)
      console.log(
        "[login v2] captchaToken len=",
        captchaToken?.length,
        "identifier=",
        identifier
      );

      // 1) Verificar reCAPTCHA v2 contra Google (siteverify)
      //    Para checkbox v2, Google devuelve { success, hostname, challenge_ts, 'error-codes'? }
      const captcha = await verifyRecaptchaV2(captchaToken, req.ip);
      console.log("[reCAPTCHA v2]", captcha);

      if (!captcha?.success) {
        // Tip: si querés ver por qué falló, mirá 'error-codes'
        // Ej: { 'error-codes': [ 'invalid-input-response' ] }
        return res.status(400).json({ message: "Captcha inválido" });
      }

      // (Opcional) En dev podés verificar hostname para evitar tokens de otros sitios
      const isDev = process.env.NODE_ENV !== "production";
      if (isDev && captcha.hostname && captcha.hostname !== "localhost") {
        return res
          .status(400)
          .json({ message: "Captcha de dominio no válido" });
      }

      // 2) Buscar usuario por username o email
      const user = await User.findOne({
        $or: [{ username: identifier }, { email: identifier }],
      });

      // Respuesta genérica para no filtrar si el usuario existe o no
      if (!user) {
        return res.status(400).json({ message: "Credenciales inválidas" });
      }

      // 3) Verificar contraseña (argon2)
      const ok = await argon2.verify(user.passwordHash, password);
      if (!ok) {
        return res.status(400).json({ message: "Credenciales inválidas" });
      }

      // 4) Firmar JWT (no incluimos datos sensibles)
      const token = jwt.sign(
        { id: user._id.toString(), username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      // 5) Responder user mínimo (nunca passwordHash)
      return res.json({
        token,
        user: {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
        },
      });
    } catch (e) {
      console.error("[/api/auth/login] Error:", e);
      return res.status(500).json({ message: "Error interno" });
    }
  }
);

// GET /api/auth/me
// - Devuelve el usuario de la sesión (JWT requerido)
router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("username email role");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });
    return res.json({ user });
  } catch (e) {
    return res.status(500).json({ message: "Error interno" });
  }
});

module.exports = router;
