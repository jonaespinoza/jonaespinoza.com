// utils/visitRateLimit.js
// Rate-limit en memoria PARA VISITAS (demo).
// - Clave: `${ip}:${photoId}`
// - Ventana: por defecto 1 hora (configurable)
// Nota: para producción, usar Redis o un store externo.

const hits = new Map(); // { key -> expiresAt(ms) }

function nowMs() {
  return Date.now();
}

/**
 * Marca un hit para (ip, photoId). Devuelve true si DEBEMOS CONTAR la visita,
 * o false si está rate-limiteado aún.
 */
function shouldCountVisit(ip, photoId, windowMs = 60 * 60 * 1000) {
  const key = `${ip}:${photoId}`;
  const current = hits.get(key);
  const t = nowMs();

  // Limpieza perezosa: si expiró, lo borramos
  if (current && current <= t) {
    hits.delete(key);
  }

  if (hits.has(key)) {
    // Aún dentro de la ventana: NO contamos
    return false;
  }

  // Marcamos nueva ventana
  hits.set(key, t + windowMs);
  return true;
}

module.exports = { shouldCountVisit };
