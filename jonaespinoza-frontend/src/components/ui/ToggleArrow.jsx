import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

// ✅ Componente reutilizable para mostrar una flechita que despliega contenido
function ToggleArrow({ children, className = "", iconClass = "" }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <div className={`w-full ${className}`}>
      {/* Botón solo con ícono */}
      <button
        onClick={toggle}
        className={`text-xl p-2 rounded-full transition-transform duration-300 hover:bg-white/10 focus-visible:focus-visible ${iconClass}`}
        aria-label="Mostrar/ocultar contenido"
      >
        <FiChevronDown
          className={`transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Contenido desplegable */}
      {isOpen && <div className="mt-4">{children}</div>}
    </div>
  );
}

export default ToggleArrow;
