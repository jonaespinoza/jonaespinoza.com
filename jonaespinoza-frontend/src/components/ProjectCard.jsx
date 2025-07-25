import React, { useState } from "react";
import { motion } from "framer-motion";
import Text from "./Text";

function ProjectCard({ tKey, frontImage, backImage, link }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden group cursor-pointer shadow-lg transition-transform duration-500"
      whileHover={{ scale: 1.03 }}
    >
      {/* Imagen de frente */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 z-10 ${
          flipped ? "opacity-0" : "opacity-100"
        }`}
        style={{ backgroundImage: `url(${frontImage})`, filter: "blur(4px)" }}
      ></div>

      {/* Imagen de atrás */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 z-10 ${
          flipped ? "opacity-100" : "opacity-0"
        }`}
        style={{ backgroundImage: `url(${backImage})`, filter: "blur(4px)" }}
      ></div>

      {/* Texto centrado - solo visible en hover */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 z-20 ${
          flipped ? "opacity-100" : "opacity-0"
        }`}
      >
        <Text
          tKey={tKey}
          as="h3"
          className="text-white text-xl font-semibold drop-shadow-md text-center"
        />
      </div>
    </motion.a>
  );
}

export default ProjectCard;
