// Explicación:
// - Envuelve rutas que requieren sesión.
// - Si todavía estamos "bootstrapping" la sesión, muestra un placeholder (o nada).
// - Si no hay sesión, redirige al home (y podés abrir el login si querés).

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { isAuthenticated, bootstrapping } = useAuth();

  // Mientras intentamos restaurar sesión, evitar parpadeos
  if (bootstrapping) return null; // o un loader simple

  // Si no hay sesión, redirigimos (podés cambiar a /login si tuvieras una ruta)
  if (!isAuthenticated) return <Navigate to="/" replace />;

  // Si hay sesión, renderizamos el contenido protegido
  return children;
}
