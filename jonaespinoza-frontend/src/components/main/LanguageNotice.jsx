import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import Text from "../Text";

function LanguageNotice() {
  const { i18n } = useTranslation();
  const [show, setShow] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    // Mostrar solo si no es español Y si el usuario activó manualmente el cambio
    const userChanged = localStorage.getItem("langChangedByUser") === "true";
    if (i18n.language !== "es" && userChanged) {
      setShow(true);
      localStorage.removeItem("langChangedByUser"); // Mostrar solo una vez
    }
  }, [i18n.language]);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Fondo oscuro animado */}
          <motion.div
            className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          {/* Modal centrado */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed z-[9999] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-dark text-white p-6 rounded-lg shadow-xl w-11/12 max-w-md text-center"
          >
            <button
              onClick={() => setShow(false)}
              className="absolute top-2 right-3 text-white text-xl hover:text-accent"
            >
              &times;
            </button>

            <Text tKey="notice.message" as="p" className="text-sm" />

            <button
              onClick={() => setShow(false)}
              className="mt-4 px-4 py-2 bg-primary hover:bg-primary-light text-sm rounded transition"
            >
              <Text tKey="notice.close" />
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default LanguageNotice;
