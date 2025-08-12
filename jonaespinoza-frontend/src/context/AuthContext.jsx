// Explicación:
// - Contexto global de autenticación para el front.
// - Persiste la sesión usando localStorage: 'authToken' y 'authUser'.
// - Rehidrata sesión al cargar la app (sobrevive al refresh).
// - Expone: isAuthenticated, user, login(token, user), logout().
// - Preparado para futuro: si agregamos /api/auth/me, se puede hidratar el user desde el backend.

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // 🗝️ Estado básico de sesión
  const [token, setToken] = useState(null); // JWT
  const [user, setUser] = useState(null); // datos mínimos para UI (id, username, email, role)
  const [bootstrapping, setBootstrapping] = useState(true); // evita parpadeos iniciales

  // 🔁 Re-hidratación al montar: leemos lo que haya en localStorage
  useEffect(() => {
    try {
      const t = localStorage.getItem("authToken");
      const u = localStorage.getItem("authUser");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {
      // ignoramos errores de parseo
    } finally {
      setBootstrapping(false);
    }
  }, []);

  // 🔐 Iniciar sesión: guarda token+user en memoria y localStorage
  const login = (newToken, newUser) => {
    setToken(newToken || null);
    setUser(newUser || null);
    try {
      if (newToken) localStorage.setItem("authToken", newToken);
      if (newUser) localStorage.setItem("authUser", JSON.stringify(newUser));
    } catch {
      // storage puede fallar en modos privados; la sesión queda en memoria
    }
  };

  // 🚪 Cerrar sesión: limpia todo
  const logout = () => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("authUser");
    } catch {}
  };

  // ✅ Derivado: si hay token asumimos autenticado (mejor UX que depender de /me)
  const isAuthenticated = !!token;

  const value = useMemo(
    () => ({ isAuthenticated, token, user, login, logout, bootstrapping }),
    [isAuthenticated, token, user, bootstrapping]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
