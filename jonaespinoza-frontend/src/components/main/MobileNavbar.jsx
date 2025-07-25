import React, { useEffect, useState } from "react";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { AnimatePresence } from "framer-motion";

function MobileNavbar({ onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    // Prevenir scroll cuando el menú está abierto
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      <div className="md:hidden sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center px-4 py-4 bg-primary dark:bg-primary-dark text-white shadow-lg">
          <span className="text-lg font-bold truncate">jonaespinoza.com</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <button
              className="touch-target text-white text-2xl focus:outline-none focus-visible:focus-visible p-2 rounded"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Abrir menú"
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex justify-end md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-primary dark:bg-primary-dark text-white w-80 max-w-[85%] p-6 h-full overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-xl font-semibold">Menú</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="touch-target text-xl p-2 rounded focus-visible:focus-visible"
                  aria-label="Cerrar menú"
                >
                  ×
                </button>
              </div>

              <MenuLinks
                onClick={() => setIsOpen(false)}
                onLoginClick={onLoginClick}
              />
            </div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileNavbar;
