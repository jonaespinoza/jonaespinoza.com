// Qué es: Página pública de fotos conectada al backend.
// Qué hacemos: pedimos la lista pública al backend, adaptamos la data
// a las props de PhotoCard, respetamos orden/paginación y controles admin.
// Preparado para futuro: si sumamos más filtros, solo extendemos el llamado a listPublic.

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/main/Layout";
import Text from "../components/main/Text";
import PhotoCarousel from "../components/photos/PhotoCarousel";
import PhotoCard from "../components/photos/PhotoCard";
import PhotoAdminBar from "../components/photos/PhotoAdminBar";
import PhotoAdminControls from "../components/photos/PhotoAdminControls";
import { useTranslation } from "react-i18next";
import { AnimatePresence, motion } from "framer-motion";

import { composeLocalizedText } from "../utils/photoI18n";

// Servicio → backend real
import photosService from "../services/photosServices";
// Normalizador de URL para que /uploads funcione en dev+prod
import { resolveImageUrl } from "../utils/resolveImageUrl";

function PhotoPage() {
  // ⚙️ Estado de UI
  const [sortOption, setSortOption] = useState("newest"); // newest|oldest|taken-asc|taken-desc|relevant
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 16;

  // 🗂️ Estado de datos
  const [items, setItems] = useState([]); // lista de fotos de la página actual
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // 🚦 Estado de ciclo de vida
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { i18n, t } = useTranslation();
  const navigate = useNavigate();

  // 🔄 Traer lista pública del backend al cambiar sort o page
  useEffect(() => {
    let cancel = false;

    async function fetchPhotos() {
      try {
        setLoading(true);
        setError("");
        const data = await photosService.listPublic({
          sort: sortOption,
          page: currentPage,
          limit: photosPerPage,
        });
        if (cancel) return;
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems ?? data.items?.length ?? 0);
      } catch (e) {
        if (cancel) return;
        setError(e.message || "Error al cargar fotos");
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    fetchPhotos();
    return () => {
      cancel = true;
    };
  }, [sortOption, currentPage]);

  // ♻️ Helper de refetch (lo llamamos tras acciones admin)
  const refetch = () => {
    setLoading(true);
    setError("");
    photosService
      .listPublic({ sort: sortOption, page: currentPage, limit: photosPerPage })
      .then((data) => {
        setItems(data.items || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems ?? data.items?.length ?? 0);
      })
      .catch((e) => setError(e.message || "Error al refrescar"))
      .finally(() => setLoading(false));
  };

  // 🧭 Acciones admin globales
  const handleCreate = () => navigate("/fotos/agregarfoto");

  // 🔁 Toggle visibilidad por ítem y refrescar lista
  const handleVisibilityChange = async (photoId, nextValue) => {
    try {
      await photosService.setVisibility(photoId, nextValue);
      refetch();
    } catch (e) {
      console.error("setVisibility failed:", e);
    }
  };

  // ⬅️➡️ Paginación
  const handlePrev = () => currentPage > 1 && setCurrentPage(currentPage - 1);
  const handleNext = () =>
    currentPage < totalPages && setCurrentPage(currentPage + 1);

  // 🧠 Adaptar DTO backend → props de PhotoCard/controles
  const adapted = useMemo(
    () =>
      items.map((p) => ({
        id: p.id,
        image: resolveImageUrl(p.imageUrl), // normalizamos para dev+prod
        titleKey: composeLocalizedText(p, "title", i18n.language, t),
        textKey: composeLocalizedText(p, "subtitle", i18n.language, t),
        isVisible: p.isVisible,
      })),
    [items, i18n.language, t]
  );

  return (
    <Layout>
      {/* Carrusel de destacadas (puede quedar mock o conectarlo luego) */}
      <PhotoCarousel />

      <section className="pt-20 px-4 md:px-12 max-w-6xl mx-auto">
        {/* Barra admin global (se dibuja si hay token adentro del componente) */}
        <PhotoAdminBar onCreate={handleCreate} />

        {/* Selector de orden */}
        <div className="mb-8 flex justify-end">
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setCurrentPage(1); // al cambiar orden, volvemos a página 1
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

        {/* Estados básicos */}
        {loading && (
          <div>
            <Text>{t("loading") || "Cargando..."}</Text>
          </div>
        )}
        {error && (
          <div>
            <Text>{error}</Text>
          </div>
        )}

        {/* Grilla de tarjetas con animación */}
        {!loading && !error && (
          <AnimatePresence mode="wait">
            <motion.div
              key={sortOption + currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
            >
              {adapted.map((photo) => (
                <div key={photo.id}>
                  {/* Tarjeta pública */}
                  <PhotoCard
                    id={photo.id}
                    image={photo.image}
                    titleKey={photo.titleKey}
                    textKey={photo.textKey}
                  />

                  {/* Controles admin por foto (si hay token, se muestran) */}
                  <PhotoAdminControls
                    photo={{ id: photo.id, isVisible: photo.isVisible }}
                    variant="list"
                    onEdit={(id) => navigate(`/fotos/${id}/editar`)}
                    onVisibilityChange={(id, next) =>
                      handleVisibilityChange(photo.id, next)
                    }
                    onVisit={(id) => navigate(`/fotos/${id}`)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Paginación */}
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

        {/* Total de ítems */}
        <div className="mt-4">
          <Text>{(t("photos.total") || "Total:") + " " + totalItems}</Text>
        </div>
      </section>
    </Layout>
  );
}

export default PhotoPage;
