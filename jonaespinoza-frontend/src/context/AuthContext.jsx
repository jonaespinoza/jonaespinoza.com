// Explicación:
// - Maneja autenticación global.
// - Guarda token y usuario al hacer login.
// - Restaura sesión al recargar (si hay token válido, llama /api/auth/me).
// - Expone isAuthenticated, user, login(), logout().
// - Comentarios explican cada paso para que puedas modificar diseño o storage futuro.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Estado base de la sesión: usuario y si está autenticado
  const [user, setUser] = useState(null);
  const isAuthenticated = !!user; // derivado: si hay user, hay sesión
  const [bootstrapping, setBootstrapping] = useState(true); // evita parpadeos al cargar

  // Helper: leer token desde localStorage (en producción preferir cookie HttpOnly del backend)
  const getToken = () => localStorage.getItem("auth_token");

  // Login exitoso: guarda token y user en memoria/localStorage
  const login = ({ token, user }) => {
    // Guardamos token para futuras llamadas
    localStorage.setItem("auth_token", token);
    // Guardamos usuario en memoria para la UI
    setUser(user);
  };

  // Logout: limpia todo
  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
  };

  // Restaurar sesión al montar la app
  useEffect(() => {
    // Si no hay token, terminamos bootstrap rápido
    const token = getToken();
    if (!token) {
      setBootstrapping(false);
      return;
    }

    // Si hay token, preguntamos al backend quién soy (/auth/me)
    // Esto confirma que el token sigue siendo válido
    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // enviamos el token
          },
        });
        if (!res.ok) {
          // Token inválido/expirado: limpiamos
          localStorage.removeItem("auth_token");
          setUser(null);
        } else {
          const data = await res.json();
          // Esperamos { user: {...} }
          setUser(data?.user || null);
        }
      } catch {
        // Error de red: no asumimos sesión
        localStorage.removeItem("auth_token");
        setUser(null);
      } finally {
        setBootstrapping(false);
      }
    })();
  }, []);

  const value = useMemo(
    () => ({ isAuthenticated, user, login, logout, bootstrapping }),
    [isAuthenticated, user, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
