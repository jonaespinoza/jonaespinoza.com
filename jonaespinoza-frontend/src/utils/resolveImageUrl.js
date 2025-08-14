// Qué es: Helper para normalizar URLs de imagen según entorno.
// Qué hacemos: si estamos en dev y la URL apunta a localhost:4000/uploads,
// la reescribimos a /uploads/... (mismo origen del front por el proxy).
// En prod no tocamos nada (deja la URL tal como la devuelve el backend/CDN).

export function resolveImageUrl(url = "") {
  // Si no hay url, devolvemos cadena vacía para no romper <img>
  if (!url) return "";

  // Si ya es relativa (ej: "/uploads/..."), no tocamos nada:
  if (url.startsWith("/")) return url;

  // Detectar dev usando Vite:
  const isDev = import.meta.env && import.meta.env.DEV;

  // Si es absoluta a localhost:4000/uploads, reescribimos a ruta relativa proxyeada
  if (isDev && /^https?:\/\/localhost:4000\/uploads\//i.test(url)) {
    // Extraemos solo la parte "/uploads/..."
    const relative = url.replace(/^https?:\/\/localhost:4000/i, "");
    return relative; // -> "/uploads/..."
  }

  // Cualquier otro caso, devolvemos la URL tal cual (prod o CDN)
  return url;
}
