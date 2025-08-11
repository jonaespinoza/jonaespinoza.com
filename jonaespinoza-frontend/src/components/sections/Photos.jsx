import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SectionWrapper from "../main/SectionWrapper";
import PhotoCard from "../photos/PhotoCard";
import ExpandableSectionHeader from "../ExpandableSectionHeader";
import { useTranslation } from "react-i18next";
import photos from "../../data/photosData";

function Photos() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const togglePhotos = () => setIsOpen((prev) => !prev);

  const featuredPhotos = photos.filter((photo) => photo.featured).slice(0, 5);

  return (
    <SectionWrapper id="fotos">
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
            <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
              {t("photos.description")}
            </p>

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
