import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FadeCarousel({ items = [], className = "" }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 10000); // cada 10s
    return () => clearInterval(interval);
  }, [items.length]);

  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <AnimatePresence mode="wait">
        {(items || []).map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: index === current ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {item}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
