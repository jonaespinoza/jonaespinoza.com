// Login.jsx
// Explicación general:
// - Mantiene tu popup/animación/tema tal cual.
// - En el submit, siempre genera un token de reCAPTCHA v3 con action "login".
// - Si no hay token (script no cargó / error), NO envía el form y muestra error claro.
// - Si hay token, llama al backend: POST { identifier, password, captchaToken } a /api/auth/login.
// - Si responde OK, guarda sesión via useAuth().login({ token, user }) y cierra.
// - Bloquea cerrar con click afuera/ESC mientras está "loading" para evitar estados inconsistentes.

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import RecaptchaCheckbox from "../components/ui/RecaptchaCheckbox";

function Login({ onClose }) {
  // ---- Estado de inputs/UI ----
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // evita doble submit/cierre accidental
  const [error, setError] = useState(""); // mensaje visible al usuario

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
      if (loading) return; // no cerrar mientras procesa
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

  // Helper: espera a que el script de reCAPTCHA esté listo y genera un token v3
  const getCaptchaToken = async () => {
    try {
      const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
      if (!siteKey) {
        console.warn("reCAPTCHA: falta VITE_RECAPTCHA_SITE_KEY");
        return null;
      }

      // Esperamos hasta 2s a que el script cargue
      const waitFor = (cond, ms = 2000, step = 50) =>
        new Promise((resolve) => {
          const t0 = Date.now();
          const tick = () => {
            if (cond()) return resolve(true);
            if (Date.now() - t0 > ms) return resolve(false);
            setTimeout(tick, step);
          };
          tick();
        });

      const ok = await waitFor(
        () =>
          typeof window !== "undefined" &&
          typeof window.grecaptcha !== "undefined"
      );
      if (!ok) {
        console.warn("reCAPTCHA: grecaptcha no cargó");
        return null;
      }

      // Comentarios: ready usa callback; execute es enterprise.
      await new Promise((r) => window.grecaptcha.enterprise.ready(r));
      const token = await window.grecaptcha.enterprise.execute(
        import.meta.env.VITE_RECAPTCHA_SITE_KEY,
        { action: "login" } // debe matchear con expectedAction del backend
      );

      return token || null;
    } catch (e) {
      console.warn("reCAPTCHA error:", e);
      return null;
    }
  };

  // Base URL del backend (evita enviar al 5173)
  const API = import.meta.env.VITE_API_BASE_URL || "";

  // Submit del formulario ///////////////
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
      // 2) Login al backend con token v2
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || ""}/api/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            identifier: username,
            password,
            captchaToken,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        // Si el backend rechaza el captcha, reseteamos el widget
        if (recaptchaRef.current) recaptchaRef.current.reset();
        throw new Error(err?.message || "Error de autenticación");
      }

      const data = await res.json();
      if (!data?.token || !data?.user)
        throw new Error("Respuesta inválida del servidor");

      login({ token: data.token, user: data.user });
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
          className={`${bgForm} p-6 rounded shadow-md w-80 relative`}
        >
          {/* Botón cerrar (deshabilitado de facto mientras loading) */}
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

          {/* Aviso solo si falta la site key en el front (útil en dev) */}
          {!import.meta.env.VITE_RECAPTCHA_SITE_KEY && (
            <p className={`${textColor} mb-2`} aria-live="polite">
              (Aviso) reCAPTCHA no configurado: agrega VITE_RECAPTCHA_SITE_KEY
              para producción.
            </p>
          )}

          {/* Errores de backend/validación (captcha/credenciales/etc.) */}
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
