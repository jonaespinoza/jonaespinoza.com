import React, { useEffect, useState } from "react";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import { AnimatePresence, motion } from "framer-motion";

function MobileNavbar({ onLoginClick }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen((prev) => !prev);

  return (
    <div className="md:hidden sticky top-0 z-50 w-full">
      {/* Bloque de navbar normal */}
      <div className="flex justify-between items-center px-4 py-3 bg-primary dark:bg-primary-dark text-white shadow">
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

      {/* Menú como extensión */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-primary dark:bg-primary-dark text-white px-6 py-4 border-t-2 border-primary-dark dark:border-primary max-h-[80vh] overflow-y-auto">
              <MenuLinks
                onClick={() => setIsOpen(false)}
                onLoginClick={onLoginClick}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default MobileNavbar;
