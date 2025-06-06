// src/components/GameCard.jsx

import { useTranslation } from "react-i18next";

function GameCard({ tKey, frontImage, backImage, link }) {
  const { t } = useTranslation();

  return (
    <a
      href={link}
      className="relative block overflow-hidden rounded-2xl shadow-lg transform transition-transform duration-300 hover:scale-105 group"
    >
      {/* 🖼️ Imagen frontal */}
      <img
        src={frontImage}
        alt={t(tKey)}
        className="w-full h-64 object-cover"
      />

      {/* 🪄 Capa posterior (opcional para hover o diseño futuro) */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 flex items-center justify-center text-white text-xl font-bold text-center p-4">
        {t(tKey)}
      </div>
    </a>
  );
}

export default GameCard;
