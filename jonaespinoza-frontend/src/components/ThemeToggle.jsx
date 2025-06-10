import React, { useEffect, useState } from "react";

function ThemeToggle({ compact = false }) {
  const [isDark, setIsDark] = useState(false);

  // ⬇️ Inicializa el modo desde localStorage o sistema
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (storedTheme === "dark" || (!storedTheme && prefersDark)) {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    } else {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const isCurrentlyDark = document.documentElement.classList.contains("dark");
    if (isCurrentlyDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setIsDark(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="text-xl hover:text-accent transition"
      title={isDark ? "Modo claro" : "Modo oscuro"}
    >
      {isDark ? "🌙" : "☀️"}
    </button>
  );
}

export default ThemeToggle;
