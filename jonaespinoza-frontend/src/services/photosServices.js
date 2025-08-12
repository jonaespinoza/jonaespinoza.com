// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\services\photosService.js
// ============================================================================
// Servicio de Fotos: centraliza TODAS las llamadas HTTP del front relacionadas
// con fotos. La idea es que los componentes usen estas funciones y no conozcan
// rutas, headers, ni formatos de request/response del backend.
//
// 🔧 Config:
// - Usa VITE_API_BASE_URL (por ej. http://localhost:4000) si existe.
// - Si no, cae por defecto en "http://localhost:4000".
// - Maneja JSON por defecto y 'multipart/form-data' cuando subimos imagen.
//
// 🔐 Auth:
// - Para endpoints admin, lee el token desde localStorage ('authToken') y agrega
//   el header Authorization: Bearer <token>.
//
// 🧪 Errores:
// - Lanza errores con { status, message } ya parseados para que el componente
//   pueda mostrar toasts/mensajes claros.
//
// 📦 Exporta helpers:
//   Público:
//     - listPublic({ page, limit, sort, q, tag, featured })
//     - getPublic(id)
//     - visit(id)
//   Admin (las dejamos listas aunque todavía no las uses):
//     - create({ metadata, file })
//     - update(id, { metadata, file })
//     - setVisibility(id, isVisible)
//     - setFeatured(id, featured)
//     - reorder(items)           // [{id, order}...]
//     - getHistory(id, {page,limit})
//     - listAdmin({ page, limit, sort, q, tag, featured, isVisible, isArchived })
//     - archive(id, isArchived)  // true=archivar, false=desarchivar
//     - remove(id)               // soft-delete (archivar) como atajo
// ============================================================================

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:4000";

// --------------------------
// Utilidades internas
// --------------------------

// Construye headers para JSON; agrega Authorization si hay token.
function buildJsonHeaders(isAdmin = false) {
  const headers = { "Content-Type": "application/json" };
  if (isAdmin) {
    const token = localStorage.getItem("authToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Envuelve fetch y parsea errores en un formato consistente.
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);

  // Intentamos parsear el cuerpo como JSON (si lo hay)
  let data = null;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    // Intentamos extraer un mensaje legible
    const message =
      (data && (data.message || data.error || JSON.stringify(data))) ||
      `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

// --------------------------
// API Pública
// --------------------------

// Lista pública: solo fotos visibles y no archivadas.
// Params: { page=1, limit=16, sort='newest', q, tag, featured }
export async function listPublic(params = {}) {
  const { page = 1, limit = 16, sort = "newest", q, tag, featured } = params;

  const usp = new URLSearchParams();
  usp.set("page", page);
  usp.set("limit", limit);
  usp.set("sort", sort);
  if (q) usp.set("q", q);
  if (tag) usp.set("tag", tag);
  if (typeof featured !== "undefined") usp.set("featured", String(featured));

  return request(`/api/public/photos?${usp.toString()}`, {
    method: "GET",
  });
}

// Detalle público por id (404 si no visible/no existe).
export async function getPublic(id) {
  return request(`/api/public/photos/${id}`, { method: "GET" });
}

// Sumar visita (rate-limit por IP del lado del backend).
export async function visit(id) {
  return request(`/api/public/photos/${id}/visit`, { method: "POST" });
}

// --------------------------
// API Admin (requiere token)
// --------------------------

// Crear foto: multipart con { file, metadata }.
// metadata = objeto con campos (title, descriptionMd, etc.)
export async function create({ metadata, file }) {
  if (!file) {
    const err = new Error("Falta 'file' en create()");
    err.status = 400;
    throw err;
  }
  const token = localStorage.getItem("authToken");
  if (!token) {
    const err = new Error("No autenticado");
    err.status = 401;
    throw err;
  }

  const form = new FormData();
  form.append("image", file);
  form.append("metadata", JSON.stringify(metadata || {}));

  const res = await fetch(`${BASE}/api/photos`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      // ⚠️ No poner Content-Type: multipart; el navegador lo setea solo con el boundary correcto.
    },
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text || null;
    }
    const message =
      (data && (data.message || data.error)) || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return res.json();
}

// Actualizar foto: si pasás file → multipart; si no → JSON.
export async function update(id, { metadata = {}, file } = {}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    const err = new Error("No autenticado");
    err.status = 401;
    throw err;
  }

  // Si hay archivo, usamos multipart
  if (file) {
    const form = new FormData();
    form.append("image", file);
    // Si también mandamos metadata, la incluimos como string JSON
    form.append("metadata", JSON.stringify(metadata));

    const res = await fetch(`${BASE}/api/photos/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
    if (!res.ok) {
      const text = await res.text();
      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text || null;
      }
      const message =
        (data && (data.message || data.error)) || `HTTP ${res.status}`;
      const err = new Error(message);
      err.status = res.status;
      err.payload = data;
      throw err;
    }
    return res.json();
  }

  // Sin archivo → JSON normal
  return request(`/api/photos/${id}`, {
    method: "PUT",
    headers: buildJsonHeaders(true),
    body: JSON.stringify(metadata),
  });
}

// Toggle visibilidad: { isVisible: boolean }
export async function setVisibility(id, isVisible) {
  return request(`/api/photos/${id}/visibility`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify({ isVisible: Boolean(isVisible) }),
  });
}

// Toggle destacada: { featured: boolean }
export async function setFeatured(id, featured) {
  return request(`/api/photos/${id}/featured`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify({ featured: Boolean(featured) }),
  });
}

// Reordenamiento de destacadas: items = [{ id, order }, ...]
export async function reorder(items) {
  return request(`/api/photos/reorder`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify(items || []),
  });
}

// Historial por foto (paginado)
export async function getHistory(id, { page = 1, limit = 20 } = {}) {
  const usp = new URLSearchParams();
  usp.set("page", page);
  usp.set("limit", limit);
  return request(`/api/photos/${id}/history?${usp.toString()}`, {
    method: "GET",
    headers: buildJsonHeaders(true),
  });
}

// Lista admin con filtros
export async function listAdmin(params = {}) {
  const {
    page = 1,
    limit = 16,
    sort = "newest",
    q,
    tag,
    featured,
    isVisible,
    isArchived,
  } = params;

  const usp = new URLSearchParams();
  usp.set("page", page);
  usp.set("limit", limit);
  usp.set("sort", sort);
  if (q) usp.set("q", q);
  if (tag) usp.set("tag", tag);
  if (typeof featured !== "undefined") usp.set("featured", String(featured));
  if (typeof isVisible !== "undefined") usp.set("isVisible", String(isVisible));
  if (typeof isArchived !== "undefined")
    usp.set("isArchived", String(isArchived));

  return request(`/api/photos?${usp.toString()}`, {
    method: "GET",
    headers: buildJsonHeaders(true),
  });
}

// Archivar / desarchivar
export async function archive(id, isArchived) {
  return request(`/api/photos/${id}/archive`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify({ isArchived: Boolean(isArchived) }),
  });
}

// Atajo para "eliminar" (soft-delete = archivar)
export async function remove(id) {
  return request(`/api/photos/${id}`, {
    method: "DELETE",
    headers: buildJsonHeaders(true),
  });
}
