import React from "react";
import { useTranslation } from "react-i18next";

function LanguageToggle() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === "es" ? "en" : "es";
    i18n.changeLanguage(newLang);
    localStorage.setItem("lang", newLang); // Persistir idioma
    localStorage.setItem("langChangedByUser", "true"); // Marcar que lo cambió el usuario
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm px-2 py-1 rounded hover:text-accent transition"
    >
      {i18n.language === "es" ? "EN" : "ES"}
    </button>
  );
}

export default LanguageToggle;
