import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = (username, password) => {
    // Simulación de login (reemplazás con backend real más adelante)
    if (username === "admin" && password === "1234") {
      setUser({ username });
      navigate("/admin");
    } else {
      alert("Credenciales inválidas");
    }
  };

  const logout = () => {
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usarlo fácil
export function useAuth() {
  return useContext(AuthContext);
}
