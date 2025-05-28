import React from "react";
import SectionWrapper from "./SectionWrapper";
import PhotoCard from "./PhotoCard";
import { useTranslation } from "react-i18next";
import photos from "../data/photosData"; // ✅ Importa todo el array

function Photos() {
  const { t } = useTranslation();

  // 🔍 Filtramos solo las fotos destacadas
  const featuredPhotos = photos.filter((photo) => photo.featured).slice(0, 5);

  return (
    <SectionWrapper
      id="fotos"
      titleKey="photos.title"
      contentKey="photos.description"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-6">
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

      <div className="mt-8 flex justify-center">
        <a
          href="/fotos"
          className="px-4 py-2 bg-accent rounded hover:bg-primary-dark transition"
        >
          {t("photos.seeMore")}
        </a>
      </div>
    </SectionWrapper>
  );
}

export default Photos;
