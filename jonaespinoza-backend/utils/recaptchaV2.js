// verifyRecaptchaV2:
// - Envía el token del checkbox a Google (siteverify) junto con tu SECRET.
// - Devuelve el JSON de Google. Para v2 "checkbox" no hay score: solo success/hostname/challenge_ts.

const fetch = require("node-fetch"); // si tu Node <18

async function verifyRecaptchaV2(token, remoteIp) {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) throw new Error("Falta RECAPTCHA_SECRET_KEY");

  const params = new URLSearchParams();
  params.append("secret", secret);
  params.append("response", token || "");
  if (remoteIp) params.append("remoteip", remoteIp);

  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  const data = await res.json();
  return data; // { success, challenge_ts, hostname, 'error-codes'? }
}

module.exports = { verifyRecaptchaV2 };
