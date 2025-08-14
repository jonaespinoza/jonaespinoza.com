// Qué es: Hero/cabecera visual con carrusel de fotos destacadas a pantalla completa.
// Qué hacemos: Traemos SOLO destacadas del backend; armamos un slide automático sin controles.
// Si no hay destacadas, no renderizamos nada.
// Preparado para futuro: el orden de transición respeta "order" si viene del backend.

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Text from "../main/Text";

// Servicio real y helper dev/prod
import photosService from "../../services/photosServices";
import { resolveImageUrl } from "../../utils/resolveImageUrl";

const intervalTime = 5000; // 5 segundos por imagen

function PhotoCarousel() {
  // Estado de datos
  const [items, setItems] = useState([]); // fotos destacadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Estado del slide
  const [index, setIndex] = useState(0);

  // Fetch de destacadas
  useEffect(() => {
    let cancel = false;
    async function fetchFeatured() {
      try {
        setLoading(true);
        setError("");
        const data = await photosService.listPublic({
          featured: true, // 🔑 solo destacadas
          page: 1,
          limit: 12, // traemos varias por si querés ampliar luego
          sort: "newest", // fallback si no usamos 'order'
        });
        if (cancel) return;
        setItems(Array.isArray(data.items) ? data.items : []);
        setIndex(0); // reset al primer slide
      } catch (e) {
        if (cancel) return;
        setError(e.message || "Error al cargar carrusel");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    fetchFeatured();
    return () => {
      cancel = true;
    };
  }, []);

  // Orden y mapeo a solo URLs (respetando 'order' si existe)
  const featuredImages = useMemo(() => {
    const sorted = [...items].sort((a, b) => {
      const ao =
        typeof a.order === "number" ? a.order : Number.POSITIVE_INFINITY;
      const bo =
        typeof b.order === "number" ? b.order : Number.POSITIVE_INFINITY;
      if (ao !== bo) return ao - bo;
      const ad = a.uploadedDate ? new Date(a.uploadedDate).getTime() : 0;
      const bd = b.uploadedDate ? new Date(b.uploadedDate).getTime() : 0;
      return bd - ad;
    });
    return sorted.map((p) => resolveImageUrl(p.imageUrl));
  }, [items]);

  // Timer de rotación (solo si hay más de 0 imágenes)
  useEffect(() => {
    if (featuredImages.length === 0) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredImages.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [featuredImages.length]);

  // Si no hay destacadas (y no carga), no renderizamos nada
  if (!loading && !error && featuredImages.length === 0) {
    return null;
  }

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
      {/* Fondo con transición (solo si hay al menos 1 imagen) */}
      <AnimatePresence mode="wait">
        {featuredImages.length > 0 && (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: `url(${featuredImages[index]})` }}
          />
        )}
      </AnimatePresence>

      {/* Capa difusa y textos (se muestran igual aunque haya una sola imagen) */}
      <div className="absolute inset-0 bg-black/40 flex flex-col justify-center items-center text-center px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold mb-3"
        >
          <Text tKey="photos.title" />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-lg max-w-2xl"
        >
          <Text tKey="photos.subtitle" />
        </motion.p>
      </div>
    </div>
  );
}

export default PhotoCarousel;
