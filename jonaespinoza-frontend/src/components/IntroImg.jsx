import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import fondoInicio from "../assets/fondo-inicio.jpg";
import { useTranslation } from "react-i18next";

function IntroImg() {
  const { t } = useTranslation();

  return (
    <section
      id="sobre-mi"
      className="relative h-[90vh] w-full bg-fixed bg-center bg-cover"
      style={{ backgroundImage: `url(${fondoInicio})` }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.h1
            key={t("greeting")} // 🔥 fuerza la reanimación al cambiar idioma
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-3 drop-shadow"
          >
            {t("greeting")}
          </motion.h1>
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.p
            key={t("welcome")} // 🔥 también acá
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg max-w-xl drop-shadow"
          >
            {t("welcome")}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default IntroImg;
