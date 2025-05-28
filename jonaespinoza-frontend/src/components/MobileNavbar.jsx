import React, { useEffect, useState } from "react";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";

function MobileNavbar({ onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const isDarkMode = document.documentElement.classList.contains("dark");
      setIsDark(isDarkMode);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);
  const bgClass = isDark ? "bg-primary-dark" : "bg-primary";
  const borderClass = isDark ? "border-primary" : "border-primary-dark";

  return (
    <>
      {/* Barra superior fija */}
      <div className="md:hidden fixed top-0 left-0 w-full z-50">
        <div
          className={`flex justify-between items-center ${bgClass} text-white p-4 transition-colors duration-500`}
        >
          <span className="text-lg font-bold">jonaespinoza.com</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <button
              className="text-white text-2xl focus:outline-none"
              onClick={toggleMenu}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Menú desplegable como bloque normal */}
      {isOpen && (
        <div
          className={`md:hidden w-full ${bgClass} text-white border-t-2 ${borderClass} px-6 py-4 transition-colors duration-500`}
        >
          <div className="flex flex-col gap-4">
            <MenuLinks
              onClick={() => setIsOpen(false)}
              onLoginClick={onLoginClick}
            />
          </div>
        </div>
      )}
    </>
  );
}

export default MobileNavbar;
