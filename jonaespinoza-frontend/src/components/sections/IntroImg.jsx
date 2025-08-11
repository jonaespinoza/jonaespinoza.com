import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import fondoInicio from "../../assets/fondo-inicio.jpg";
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

      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white text-center px-4 sm:px-6 lg:px-8 pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.h1
            key={t("greeting")} // 🔥 fuerza la reanimación al cambiar idioma
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 drop-shadow"
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
            className="text-base sm:text-lg md:text-xl max-w-xl sm:max-w-2xl drop-shadow leading-relaxed"
          >
            {t("welcome")}
          </motion.p>
        </AnimatePresence>
      </div>
    </section>
  );
}

export default IntroImg;
