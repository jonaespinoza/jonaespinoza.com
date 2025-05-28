import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

function Login({ onClose }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();

  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const modalRef = useRef(null);

  // Detectar cambios de tema
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  // Cerrar al click afuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const bgPage = "bg-black/70";
  const bgForm = isDark ? "bg-primary" : "bg-white";
  const textColor = isDark ? "text-white" : "text-primary-dark";
  const inputBg = isDark ? "bg-primary-dark" : "bg-white";
  const inputBorder = isDark ? "border-white" : "border-primary-dark";
  const placeholderColor = isDark
    ? "placeholder-white"
    : "placeholder-primary-dark";

  const handleSubmit = (e) => {
    e.preventDefault();
    login(username, password);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="login-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-[9999] ${bgPage} flex items-center justify-center`}
      >
        <motion.div
          key="login-modal"
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className={`${bgForm} p-6 rounded shadow-md w-80 relative`}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-3 text-xl text-white dark:text-white hover:text-accent transition"
          >
            ❌
          </button>

          <h2 className={`text-2xl font-bold mb-4 text-center ${textColor}`}>
            Iniciar sesión
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full p-2 border ${inputBorder} rounded ${inputBg} ${textColor} ${placeholderColor} focus:outline-none`}
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full p-2 border ${inputBorder} rounded ${inputBg} ${textColor} ${placeholderColor} focus:outline-none`}
            />

            <button
              type="submit"
              className="w-full py-2 rounded text-white transition-colors duration-300 bg-red-500 dark:bg-green-500"
            >
              Ingresar
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Login;
