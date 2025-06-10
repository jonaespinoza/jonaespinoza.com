import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/en.json";
import es from "./locales/es.json";

// 🔄 Recuperamos idioma guardado (si existe), si no usamos "es"
const storedLang = localStorage.getItem("lang") || "es";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: storedLang, // 🟢 usamos el idioma persistido
  fallbackLng: "es",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
