import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import photos from "../../data/photosData";
import Text from "../Text";

const intervalTime = 5000; // 5 segundos por imagen

function PhotoCarousel() {
  const featuredImages = photos.filter((p) => p.featured).map((p) => p.image);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % featuredImages.length);
    }, intervalTime);
    return () => clearInterval(interval);
  }, [featuredImages.length]);

  return (
    <div className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
      {/* Fondo con transición */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-center bg-cover"
          style={{ backgroundImage: `url(${featuredImages[index]})` }}
        />
      </AnimatePresence>

      {/* Capa difusa y texto */}
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
