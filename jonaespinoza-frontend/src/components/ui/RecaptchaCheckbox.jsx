// Componente: RecaptchaCheckbox
// Qué es:
// - Renderiza el widget v2 "No soy un robot" sobre un <div>.
// - Guarda el token cada vez que el usuario tilda el checkbox.
// - Expone métodos .getValue() y .reset() al padre (Login) vía ref.
//
// Qué hacemos:
// - Esperamos a que cargue window.grecaptcha.
// - Llamamos grecaptcha.render(container, { sitekey, callback, 'expired-callback', 'error-callback' }).
// - Guardamos el widgetId para poder resetear.

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";

const RecaptchaCheckbox = forwardRef(function RecaptchaCheckbox(
  { siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY, theme = "light" },
  ref
) {
  const containerRef = useRef(null);
  const [widgetId, setWidgetId] = useState(null);
  const [token, setToken] = useState(null);

  // Espera activa: chequea una condicion hasta 2s
  const waitFor = (cond, ms = 2000, step = 50) =>
    new Promise((resolve) => {
      const t0 = Date.now();
      (function tick() {
        if (cond()) return resolve(true);
        if (Date.now() - t0 > ms) return resolve(false);
        setTimeout(tick, step);
      })();
    });

  useEffect(() => {
    let mounted = true;

    (async () => {
      // Esperamos a que cargue el script v2 clásico
      const ok = await waitFor(
        () => typeof window !== "undefined" && window.grecaptcha
      );
      if (!ok || !mounted || !containerRef.current || !siteKey) return;

      // Render explícito del widget
      const id = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        theme, // "light" | "dark"
        callback: (t) => setToken(t), // cuando el usuario tilda
        "expired-callback": () => setToken(null), // expira el token
        "error-callback": () => setToken(null), // error del widget
      });

      setWidgetId(id);
    })();

    return () => {
      mounted = false;
    };
  }, [siteKey, theme]);

  // Exponemos métodos al padre
  useImperativeHandle(ref, () => ({
    getValue: () => token, // devuelve el token actual (string o null)
    reset: () => {
      if (widgetId !== null && window.grecaptcha) {
        window.grecaptcha.reset(widgetId); // limpia el checkbox y el token
        setToken(null);
      }
    },
  }));

  return (
    // No agregamos clases nuevas de Tailwind (respetamos tu consigna).
    <div ref={containerRef} />
  );
});

export default RecaptchaCheckbox;
