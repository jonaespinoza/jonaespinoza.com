// Explicación:
// - Mantiene el mismo icono "Bot" y las mismas clases/efecto hover que tenías.
// - Si el usuario está autenticado, muestra "ShieldCheck" y resalta color como activo.
// - Si NO está autenticado, al click dispara onLoginClick() para abrir TU popup actual.
// - Si está autenticado, al click navega a /admin.
// - Usa useAuth() para conocer el estado de login (de tu AuthContext) y useLocation()
//   para marcar activo cuando estás en /admin.
// - No agregamos clases Tailwind nuevas; reutilizamos las que ya venías usando.

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function AdminButton({ onLoginClick = () => {} }) {
  // Estado global de autenticación (true/false)
  const { isAuthenticated } = useAuth();

  // Router para navegar a /admin si ya hay sesión
  const navigate = useNavigate();
  const location = useLocation();

  // "Activo" solo cuando estamos en /admin Y hay sesión
  const isActive = isAuthenticated && location.pathname === "/admin";

  // Click:
  // - sin sesión => abre tu popup de login
  // - con sesión  => navega a /admin (si no estamos ya ahí)
  const handleAdminClick = () => {
    if (!isAuthenticated) {
      onLoginClick(); // mantiene tu mismo popup/form de login
      return;
    }
    if (location.pathname !== "/admin") {
      navigate("/admin");
    }
  };

  return (
    <button
      onClick={handleAdminClick}
      title="Admin"
      aria-label="Admin"
      // Mantiene EXACTAMENTE tu cadena de clases y el efecto hover que ya usabas
      className={`text-white hover:text-accent transition-colors ${
        isActive ? "text-accent" : ""
      }`}
    >
      {/* Si hay sesión: icono de escudo con tilde, si no: el Bot original */}
      {isAuthenticated ? (
        <ShieldCheck className="w-6 h-6" />
      ) : (
        <Bot className="w-6 h-6" />
      )}
    </button>
  );
}
