import React, { useState } from "react";
import PhotoCard from "../components/photos/PhotoCard";
import Text from "../components/Text";
import photosData from "../data/photosData";
import Layout from "../components/main/Layout";
import PhotoCarousel from "../components/photos/PhotoCarousel"; // tu nuevo Hero
import { useTranslation } from "react-i18next";

import { AnimatePresence, motion } from "framer-motion";

function PhotoPage() {
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 16;
  const { t } = useTranslation();

  // 🔄 Ordenamiento dinámico
  const sortedPhotos = [...photosData].sort((a, b) => {
    if (sortOption === "oldest") return new Date(a.date) - new Date(b.date);
    if (sortOption === "taken-asc")
      return new Date(a.takenDate) - new Date(b.takenDate);
    if (sortOption === "taken-desc")
      return new Date(b.takenDate) - new Date(a.takenDate);
    if (sortOption === "relevant") return b.visits - a.visits;
    return new Date(b.date) - new Date(a.date); // newest (publicado)
  });

  const totalPages = Math.ceil(sortedPhotos.length / photosPerPage);
  const startIndex = (currentPage - 1) * photosPerPage;
  const currentPhotos = sortedPhotos.slice(
    startIndex,
    startIndex + photosPerPage
  );

  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  return (
    <Layout>
      <PhotoCarousel />

      <section className="pt-20 px-4 md:px-12 max-w-6xl mx-auto">
        {/* 🔽 Selector */}
        <div className="mb-8 flex justify-end">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-primary-dark dark:border-primary px-3 py-1 rounded text-sm 
             bg-white text-black dark:bg-white dark:text-black"
          >
            <option value="newest">📅 {t("photos.sort.newest")}</option>
            <option value="oldest">📆 {t("photos.sort.oldest")}</option>
            <option value="taken-desc">📷 {t("photos.sort.takenDesc")}</option>
            <option value="taken-asc">📸 {t("photos.sort.takenAsc")}</option>
            <option value="relevant">🔥 {t("photos.sort.relevant")}</option>
          </select>
        </div>

        {/* 🖼️ Galería con animación */}
        <AnimatePresence mode="wait">
          <motion.div
            key={sortOption + currentPage}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
          >
            {currentPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                id={photo.id}
                image={photo.image}
                titleKey={photo.titleKey}
                textKey={photo.textKey}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* ⬅️➡️ Paginación */}
        <div className="mt-12 flex justify-center items-center gap-4">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-primary-dark text-white rounded disabled:opacity-40"
          >
            ⬅️
          </button>
          <span className="font-semibold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-primary-dark text-white rounded disabled:opacity-40"
          >
            ➡️
          </button>
        </div>
      </section>
    </Layout>
  );
}

export default PhotoPage;
