import React from "react";

// Este componente recibe una prop 'visible' para saber si se muestra o no
function Overlay({ visible }) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black text-white z-[999] flex flex-col justify-center items-center px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">jonaespinoza.com</h1>
      <p className="text-lg text-accent">
        Estamos realizando tareas de mantenimiento.
      </p>
    </div>
  );
}

export default Overlay;
