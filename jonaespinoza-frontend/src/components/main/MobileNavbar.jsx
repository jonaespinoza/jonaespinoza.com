import React, { useEffect, useState } from "react";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { AnimatePresence, motion } from "framer-motion";

function MobileNavbar({ onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className="md:hidden sticky top-0 z-50 w-full">
        <div className="flex justify-between items-center px-4 py-3 bg-primary dark:bg-primary-dark text-white shadow">
          <span className="text-lg font-bold">jonaespinoza.com</span>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <LanguageToggle />
            <button
              className="text-white text-2xl focus:outline-none"
              onClick={() => setIsOpen(!isOpen)}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%", opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-transparent backdrop-blur-sm flex justify-end md:hidden"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="bg-primary dark:bg-primary-dark text-white w-64 max-w-[75%] p-6 h-full overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-xl font-semibold">Menú</span>
                <button onClick={() => setIsOpen(false)} className="text-xl">
                  ×
                </button>
              </div>

              <MenuLinks
                onClick={() => setIsOpen(false)}
                onLoginClick={onLoginClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobileNavbar;
