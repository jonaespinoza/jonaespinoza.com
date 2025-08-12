// Explicación general:
// - Mantiene tu UI (popup/animaciones).
// - Usa reCAPTCHA v2 (checkbox) con un ref; si no está marcado, no envía.
// - En submit exitoso, llama al backend: POST /api/auth/login con { identifier, password, captchaToken }.
// - En respuesta OK, llama useAuth().login(token, user) → persiste en localStorage y memoria.
// - Cierra el modal tras loguear; maneja errores visibles y bloquea cierre mientras "loading".

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import RecaptchaCheckbox from "../components/ui/RecaptchaCheckbox";

function Login({ onClose }) {
  // ---- Estado de inputs/UI ----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ---- Auth ----
  const { login } = useAuth();

  // ---- Tema actual (reutiliza tus clases) ----
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );
  const modalRef = useRef(null);

  // Observa cambios de tema para colorear el modal sin recargar
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

  // Cerrar al click afuera (bloqueado si loading)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (loading) return;
      if (modalRef.current && !modalRef.current.contains(event.target))
        onClose();
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, loading]);

  // Cerrar con ESC (bloqueado si loading)
  useEffect(() => {
    const handleEsc = (e) => {
      if (loading) return;
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose, loading]);

  // Paleta ligada al tema (sin agregar clases nuevas)
  const bgPage = "bg-black/70";
  const bgForm = isDark ? "bg-primary" : "bg-white";
  const textColor = isDark ? "text-white" : "text-primary-dark";
  const inputBg = isDark ? "bg-primary-dark" : "bg-white";
  const inputBorder = isDark ? "border-white" : "border-primary-dark";
  const placeholderColor = isDark
    ? "placeholder-white"
    : "placeholder-primary-dark";

  // Base URL del backend
  const API = import.meta.env.VITE_API_BASE_URL || "";

  // Submit del formulario con reCAPTCHA v2 ///////////
  const recaptchaRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Completá usuario y contraseña.");
      return;
    }

    // 1) Obtener token del checkbox
    const captchaToken = recaptchaRef.current?.getValue();
    if (!captchaToken) {
      setError("Marcá 'No soy un robot' para continuar.");
      return;
    }

    setLoading(true);
    try {
      // 2) Login al backend
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: username,
          password,
          captchaToken,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Si el backend rechaza el captcha o credenciales, reseteamos el widget
        if (recaptchaRef.current) recaptchaRef.current.reset();
        throw new Error(err?.message || "Error de autenticación");
      }

      const data = await res.json();
      if (!data?.token || !data?.user)
        throw new Error("Respuesta inválida del servidor");

      // 3) Guardar sesión global (persistente) y cerrar modal
      login(data.token, data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
          className={`${bgForm} p-6 rounded shadow-md w-100 relative`}
        >
          {/* Botón cerrar (bloqueado de facto mientras loading) */}
          <button
            onClick={!loading ? onClose : undefined}
            className="absolute top-2 right-3 text-xl text-white dark:text-white hover:text-accent transition"
            aria-label="Cerrar login"
          >
            ❌
          </button>

          <h2 className={`text-2xl font-bold mb-4 text-center ${textColor}`}>
            Iniciar sesión
          </h2>

          {/* Errores de backend/validación */}
          {error && (
            <p
              className={`${textColor} mb-2`}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              className={`w-full p-2 border ${inputBorder} rounded ${inputBg} ${textColor} ${placeholderColor} focus:outline-none`}
              autoComplete="username"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              className={`w-full p-2 border ${inputBorder} rounded ${inputBg} ${textColor} ${placeholderColor} focus:outline-none`}
              autoComplete="current-password"
            />

            {/* Checkbox reCAPTCHA v2 */}
            <RecaptchaCheckbox ref={recaptchaRef} />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 rounded text-white transition-colors duration-300 bg-red-500 dark:bg-green-500"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default Login;
