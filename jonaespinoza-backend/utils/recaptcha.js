// utils/recaptcha.js
// Explicación: en Node <18 no existe fetch nativo; traemos node-fetch v2 para CommonJS.
const fetch = require("node-fetch");

async function verifyRecaptcha(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("Falta RECAPTCHA_SECRET_KEY en el backend");

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token || "");
  if (remoteIp) params.append("remoteip", remoteIp);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  return res.json(); // { success, score?, action?, ... }
}

module.exports = { verifyRecaptcha };
