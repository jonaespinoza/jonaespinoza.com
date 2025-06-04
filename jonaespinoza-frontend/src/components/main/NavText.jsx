// src/components/NavText.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";

function NavText({ tKey, as = "span", className = "", delay = 0 }) {
  const { t } = useTranslation();
  const MotionTag = motion[as] || motion.span;

  return (
    <AnimatePresence mode="wait">
      <MotionTag
        key={t(tKey)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay }}
        className={className}
      >
        {t(tKey)}
      </MotionTag>
    </AnimatePresence>
  );
}

export default NavText;
