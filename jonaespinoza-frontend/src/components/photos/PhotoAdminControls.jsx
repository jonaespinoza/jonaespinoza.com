// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\components\photos\PhotoAdminControls.jsx
// ============================================================================
// Componente: PhotoAdminControls
// ----------------------------------------------------------------------------
// Función:
// - Renderiza los botones de administración para una foto específica (Editar,
//   Ocultar/Mostrar, Visitar). Se muestra SOLO si hay token válido en localStorage.
// - Pensado para usarse tanto en la galería (/fotos) como en el detalle (/fotos/:id).
//
// Props:
// - photo: objeto con al menos { id, isVisible } (puede incluir más campos si querés).
// - variant: 'list' | 'detail' (p/ ajustar microcomportamientos si hace falta).
// - onEdit?: (id) => void           // callback para navegar a /fotos/:id/editar
// - onVisibilityChange?: (updated)  // callback con el objeto foto actualizado (para refrescar UI)
// - onVisit?: (id) => void          // callback para abrir la vista pública (por ej. navigate)
//
// Dependencias:
// - photosService: setVisibility() para alternar publicación.
//
// Nota de diseño:
// - Sin clases Tailwind ahora. El layout es mínimo y semántico para facilitar
//   estilos futuros sin reescribir la lógica.
// - Maneja loading y errores básicos via estado local; dejé 'callbacks' para
//   que el padre decida si muestra toasts globales.
// ============================================================================

import { useState, useMemo } from "react";
import { setVisibility } from "../../services/photosServices";

export default function PhotoAdminControls({
  photo,
  variant = "list",
  onEdit,
  onVisibilityChange,
  onVisit,
}) {
  // ---------------------------
  // 1) Detección de sesión admin
  // ---------------------------
  // - Aquí usamos un chequeo simple: si hay 'authToken' en localStorage.
  // - Si después sumás roles/permisos más finos, podés reemplazar por un AuthContext.
  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem("authToken");
      return Boolean(token);
    } catch {
      return false;
    }
  }, []);

  // Si no hay admin, no renderiza nada
  if (!isAdmin) return null;

  // ---------------------------
  // 2) Estado local para UX
  // ---------------------------
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);

  // ---------------------------
  // 3) Handlers de acciones
  // ---------------------------

  // a) Editar: delegamos en el padre (normalmente navigate(`/fotos/${id}/editar`))
  const handleEdit = () => {
    if (typeof onEdit === "function") onEdit(photo?.id);
  };

  // b) Alternar visibilidad: llama API y devuelve la foto actualizada
  const handleToggleVisibility = async () => {
    if (!photo?.id) return;
    setLoading(true);
    setErr(null);
    try {
      // Enviamos el inverso de isVisible
      const updated = await setVisibility(photo.id, !photo.isVisible);

      // Si el padre quiere refrescar su lista/estado, le damos el updated
      if (typeof onVisibilityChange === "function") {
        onVisibilityChange(updated);
      }
    } catch (e) {
      // Guardamos el error en local; el padre podría mostrar un toast si quiere
      setErr(e?.message || "Error al cambiar visibilidad");
      // Si quisieras revertir un estado optimista, lo harías en el padre
    } finally {
      setLoading(false);
    }
  };

  // c) Visitar: normalmente ir a la ruta pública /fotos/:id (o a un link compartible)
  const handleVisit = () => {
    if (typeof onVisit === "function") onVisit(photo?.id);
  };

  // ---------------------------
  // 4) Render sin estilos (layout simple)
  // ---------------------------
  // - Botones mínimos para que el componente sea funcional.
  // - Dejo data-attributes para hookear estilos o tests en el futuro.
  return (
    <div
      data-component="PhotoAdminControls"
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        // Sin clases Tailwind por pedido; esto es puramente funcional.
      }}
    >
      {/* Botón Editar */}
      <button
        type="button"
        onClick={handleEdit}
        disabled={loading}
        aria-label="Editar foto"
      >
        Editar
      </button>

      {/* Botón Ocultar/Mostrar (publicación) */}
      <button
        type="button"
        onClick={handleToggleVisibility}
        disabled={loading}
        aria-label={photo?.isVisible ? "Ocultar foto" : "Publicar foto"}
      >
        {photo?.isVisible ? "Ocultar" : "Publicar"}
      </button>

      {/* Botón Visitar (abrir vista pública) */}
      <button
        type="button"
        onClick={handleVisit}
        disabled={loading}
        aria-label="Ver en el sitio"
      >
        Visitar
      </button>

      {/* Estado mínimo: loading + error local (para debug/feedback básico) */}
      {loading && <span aria-live="polite">Guardando…</span>}
      {err && (
        <span role="alert" style={{ color: "red" }}>
          {err}
        </span>
      )}
    </div>
  );
}
