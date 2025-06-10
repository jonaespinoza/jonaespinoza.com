import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function Loader() {
  const [loading, setLoading] = useState(true);
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    // Simula carga inicial
    const timeout = setTimeout(() => setLoading(false), 1000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    // Anima los puntos: ".", "..", "..."
    const interval = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-white dark:bg-black flex flex-col items-center justify-center"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Spinner semicircular */}
          <div className="w-16 h-16 border-t-4 border-primary border-solid rounded-full animate-spin mb-6"></div>

          {/* Texto animado */}
          <motion.p
            className="text-xl font-semibold text-gray-800 dark:text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Cargando{"".padEnd(dotCount, ".")}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default Loader;
