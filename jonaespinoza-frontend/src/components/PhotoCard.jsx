import React from "react";
import { Link } from "react-router-dom";
import Text from "./Text";
import "../styles/flip.css"; // Asegurate de importar los estilos si los pones fuera

function PhotoCard({ image, titleKey, textKey, id }) {
  return (
    <div className="flip-card w-full h-60">
      <div className="flip-card-inner">
        {/* Frente */}
        <Link
          to={`/fotos/${id}`}
          className="flip-card-front rounded-xl overflow-hidden shadow-md bg-white dark:bg-primary text-black dark:text-white"
        >
          <img src={image} alt="" className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-white">
            <Text tKey={titleKey} as="h3" className="text-sm font-semibold" />
          </div>
        </Link>

        {/* Reverso */}
        <Link
          to={`/fotos/${id}`}
          className="flip-card-back rounded-xl overflow-hidden shadow-md bg-white dark:bg-primary text-black dark:text-white"
        >
          <img
            src={image}
            alt=""
            className="w-full h-full object-cover blur-sm"
          />
          <div className="absolute bottom-0 left-0 right-0 p-3 bg-black/60 text-white">
            <Text tKey={textKey} as="p" className="text-xs" />
          </div>
        </Link>
      </div>
    </div>
  );
}

export default PhotoCard;
