// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\components\photos\PhotoAdminBar.jsx
// ============================================================================
// Componente: PhotoAdminBar
// ----------------------------------------------------------------------------
// Función:
// - Renderiza una barra de acciones administrativas visibles en /fotos
//   únicamente cuando el usuario admin está logueado.
// - En esta fase, muestra el botón "Agregar Nueva Foto" y delega la navegación
//   al callback onCreate (para poder cambiar routing o diseño sin tocar lógica).
//
// Props:
// - onCreate?: () => void   // callback para navegar a /fotos/agregarfoto
//
// Notas de diseño:
// - Sin clases Tailwind ni estilos acoplados. Se incluyen estilos inline mínimos
//   que podés quitar sin romper funcionalidad.
// - Preparado para agregar más acciones en el futuro (ej: "Ver Admin", "Ir a Destacadas").
// ============================================================================

import { useMemo } from "react";

export default function PhotoAdminBar({ onCreate }) {
  // ---------------------------
  // 1) Detección de sesión admin
  // ---------------------------
  // Usamos la misma heurística que PhotoAdminControls: token en localStorage.
  const isAdmin = useMemo(() => {
    try {
      const token = localStorage.getItem("authToken");
      return Boolean(token);
    } catch {
      return false;
    }
  }, []);

  // Si no hay sesión admin, no renderizamos nada
  if (!isAdmin) return null;

  // ---------------------------
  // 2) Handlers de acciones
  // ---------------------------
  const handleCreate = () => {
    if (typeof onCreate === "function") onCreate();
  };

  // ---------------------------
  // 3) Render mínimo (sin Tailwind)
  // ---------------------------
  // Estructura neutra pensada para cambiar el diseño en el futuro sin mover lógica.
  return (
    <div
      data-component="PhotoAdminBar"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 8,
        margin: "16px 0",
      }}
    >
      <button
        type="button"
        onClick={handleCreate}
        aria-label="Agregar Nueva Foto"
      >
        Agregar Nueva Foto
      </button>
    </div>
  );
}
