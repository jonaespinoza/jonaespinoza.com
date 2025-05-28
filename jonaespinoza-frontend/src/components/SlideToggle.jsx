import React from "react";

/**
 * SlideToggle: componente genérico para transiciones de altura tipo slideDown/slideUp
 * @param {boolean} open - define si el contenido está visible
 * @param {string} maxHeight - clase Tailwind opcional para definir altura máxima cuando está abierto
 * @param {ReactNode} children - contenido a mostrar/ocultar
 */
function SlideToggle({ open, maxHeight = "max-h-96", children }) {
  return (
    <div
      className={`overflow-hidden transition-max-height duration-1000 ease-in-out ${
        open ? maxHeight : "max-h-0"
      }`}
    >
      {children}
    </div>
  );
}

export default SlideToggle;
