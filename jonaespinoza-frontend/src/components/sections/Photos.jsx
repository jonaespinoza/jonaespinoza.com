// Qué es: Sección "Fotos" del Home (grid colapsable).
// Qué hacemos: Traemos SOLO destacadas desde el backend y mostramos hasta 5 PhotoCard.
// Si no hay destacadas, no renderizamos la sección.
// Preparado para futuro: si el backend devuelve "order", ordenamos por ese campo.
// Comentarios explican cada paso; sin agregar clases Tailwind nuevas.

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "../main/SectionWrapper";
import PhotoCard from "../photos/PhotoCard";
import ExpandableSectionHeader from "../ExpandableSectionHeader";
import { useTranslation } from "react-i18next";

// Servicio real y helper para imágenes dev/prod
import photosService from "../../services/photosServices";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

function Photos() {
  const { t } = useTranslation();

  // UI del acordeón
  const [isOpen, setIsOpen] = useState(false);
  const togglePhotos = () => setIsOpen((prev) => !prev);

  // Estado de datos del backend
  const [items, setItems] = useState([]); // fotos destacadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Traemos SOLO destacadas (featured=true). Limitamos a 5 para esta vista.
  useEffect(() => {
    let cancel = false;
    async function fetchFeatured() {
      try {
        setLoading(true);
        setError("");
        const data = await photosService.listPublic({
          featured: true, // 🔑 pedimos destacadas
          page: 1,
          limit: 5, // mostramos 5 en Home
          sort: "newest", // fallback si no usamos 'order'
        });
        if (cancel) return;
        setItems(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        if (cancel) return;
        setError(e.message || "Error al cargar fotos destacadas");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    fetchFeatured();
    return () => {
      cancel = true;
    };
  }, []);

  // Adaptamos DTO del backend → props de PhotoCard y aplicamos orden opcional
  const featuredPhotos = useMemo(() => {
    // Si el backend devuelve 'order' (para destacadas), lo usamos ASC; si no, quedan como vinieron
    const sorted = [...items].sort((a, b) => {
      const ao =
        typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
      const bo =
        typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      // Fallback por fecha subida desc si no hay 'order'
      const ad = a.uploadedDate ? new Date(a.uploadedDate).getTime() : 0;
      const bd = b.uploadedDate ? new Date(b.uploadedDate).getTime() : 0;
      return bd - ad;
    });

    // Map a PhotoCard (id, image, titleKey, textKey)
    return sorted.map((p) => ({
      id: p.id,
      image: resolveImageUrl(p.imageUrl),
      titleKey: p.title || "", // reusamos props existentes
      textKey: p.subtitle || "",
    }));
  }, [items]);

  // Si no hay destacadas (y no estamos cargando), no renderizamos nada
  if (!loading && !error && featuredPhotos.length === 0) {
    return null;
  }

  return (
    <SectionWrapper id="fotos">
      {/* Encabezado plegable */}
      <ExpandableSectionHeader
        title={t("photos.title")}
        isOpen={isOpen}
        toggle={togglePhotos}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="photos-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Descripción */}
            <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
              {t("photos.description")}
            </p>

            {/* Grid de destacadas (hasta 5) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              {featuredPhotos.map((photo) => (
                <PhotoCard
                  key={photo.id}
                  id={photo.id}
                  image={photo.image}
                  titleKey={photo.titleKey}
                  textKey={photo.textKey}
                />
              ))}
            </div>

            {/* CTA a /fotos */}
            <div className="mt-8 flex justify-center">
              <a
                href="/fotos"
                className="px-6 py-3 bg-accent rounded-lg hover:bg-primary-dark transition-colors duration-300 focus-visible:focus-visible"
              >
                {t("photos.seeMore")}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

export default Photos;
