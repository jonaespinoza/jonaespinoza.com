// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\services\photosService.js
// ============================================================================
// Servicio de Fotos: centraliza TODAS las llamadas HTTP del front relacionadas
// con fotos. Los componentes no deben conocer rutas/headers ni payloads.
//
// Qué hacemos en esta versión:
// - Mantenemos TODO tu contrato (funciones, rutas y manejo de errores).
// - Agregamos un "export default" con el objeto photosService, además de los
//   "named exports". Con esto podés importar como default o por nombre.
// - Devolvemos errores normalizados { status, message, payload }.
//
// Preparado para futuro:
// - BASE configurable via VITE_API_BASE_URL.
// - Soporte multipart para subir imagen.
// - Parámetro "sort" con claves (newest, oldest, taken-desc, taken-asc, relevant).
// ============================================================================

const BASE =
  (typeof import.meta !== "undefined" &&
    import.meta.env &&
    import.meta.env.VITE_API_BASE_URL) ||
  "http://localhost:4000";

// --------------------------
// Utilidades internas
// --------------------------

// Construye headers JSON; agrega Authorization si endpoint admin.
function buildJsonHeaders(isAdmin = false) {
  const headers = { "Content-Type": "application/json" };
  if (isAdmin) {
    const token = localStorage.getItem("authToken");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

// Wrapper de fetch que parsea JSON/Texto y unifica errores.
async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);

  let data = null;
  const text = await res.text(); // leemos cuerpo una sola vez
  try {
    data = text ? JSON.parse(text) : null; // intentamos JSON
  } catch {
    data = text || null; // si no es JSON, dejamos texto plano
  }

  if (!res.ok) {
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

// Helper local: garantiza que siempre haya 'id' (Mongo _id → id)
function normalizePhoto(p = {}) {
  const id = p.id ?? p._id; // si no viene id, usamos _id
  return { ...p, id };
}

// Lista pública (solo visibles/no archivadas) + normalización de IDs
export async function listPublic(params = {}) {
  const { page = 1, limit = 16, sort = "newest", q, tag, featured } = params;

  const usp = new URLSearchParams();
  usp.set("page", page);
  usp.set("limit", limit);
  usp.set("sort", sort);
  if (q) usp.set("q", q);
  if (tag) usp.set("tag", tag);
  if (typeof featured !== "undefined") usp.set("featured", String(featured));

  const data = await request(`/api/public/photos?${usp.toString()}`, {
    method: "GET",
  });

  // 🔧 Normalizamos cada item para asegurar 'id'
  const items = Array.isArray(data?.items)
    ? data.items.map(normalizePhoto)
    : [];
  return { ...data, items };
}

// Detalle público por id (404 si no visible/no existe) + normalización de ID
export async function getPublic(id) {
  const data = await request(`/api/public/photos/${id}`, { method: "GET" });
  return normalizePhoto(data);
}

// Sumar visita (rate-limited por IP en backend).
export async function visit(id) {
  return request(`/api/public/photos/${id}/visit`, { method: "POST" });
}

// --------------------------
// API Admin (requiere token)
// --------------------------

// Crear foto: multipart con { file, metadata }.
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
      // Nota: NO forzar Content-Type aquí; el navegador agrega boundary correcto.
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

// Actualizar foto: si hay file → multipart; si no → JSON.
export async function update(id, { metadata = {}, file } = {}) {
  const token = localStorage.getItem("authToken");
  if (!token) {
    const err = new Error("No autenticado");
    err.status = 401;
    throw err;
  }

  if (file) {
    const form = new FormData();
    form.append("image", file);
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

  // Sin archivo: usamos JSON normal
  return request(`/api/photos/${id}`, {
    method: "PUT",
    headers: buildJsonHeaders(true),
    body: JSON.stringify(metadata),
  });
}

// Cambiar visibilidad: { isVisible: boolean }
export async function setVisibility(id, isVisible) {
  return request(`/api/photos/${id}/visibility`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify({ isVisible: Boolean(isVisible) }),
  });
}

// Cambiar destacada: { featured: boolean }
export async function setFeatured(id, featured) {
  return request(`/api/photos/${id}/featured`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify({ featured: Boolean(featured) }),
  });
}

// Reordenar destacadas: items = [{ id, order }, ...]
export async function reorder(items) {
  return request(`/api/photos/reorder`, {
    method: "PATCH",
    headers: buildJsonHeaders(true),
    body: JSON.stringify(items || []),
  });
}

// Historial de una foto (paginado)
export async function getHistory(id, { page = 1, limit = 20 } = {}) {
  const usp = new URLSearchParams();
  usp.set("page", page);
  usp.set("limit", limit);
  return request(`/api/photos/${id}/history?${usp.toString()}`, {
    method: "GET",
    headers: buildJsonHeaders(true),
  });
}

// Listado admin con filtros
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

// Eliminar (soft-delete como atajo) — en tu backend será fase 2.
export async function remove(id) {
  return request(`/api/photos/${id}`, {
    method: "DELETE",
    headers: buildJsonHeaders(true),
  });
}

// ---------------------------------------------------------------------------
// Export default + named: permite ambas formas de import sin romper nada.
// ---------------------------------------------------------------------------
const photosService = {
  listPublic,
  getPublic,
  visit,
  create,
  update,
  setVisibility,
  setFeatured,
  reorder,
  getHistory,
  listAdmin,
  archive,
  remove,
};

export default photosService;
