import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import SectionWrapper from "../main/SectionWrapper";
import ProjectCard from "../ui/ProjectCard";
import ExpandableSectionHeader from "../ExpandableSectionHeader";

import AceburyLogo from "../../assets/aceburylogo.png";
import AceburyLogo2 from "../../assets/aceburylogo2.png";
import Hotel from "../../assets/hotel.png";
import Hotel2 from "../../assets/hotel2.png";
import Bot from "../../assets/bot.png";
import Bot2 from "../../assets/bot2.png";

import { useTranslation } from "react-i18next";

function Projects() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const toggleProjects = () => setIsOpen((prev) => !prev);

  return (
    <SectionWrapper id="proyectos">
      <ExpandableSectionHeader
        title={t("projects.title")}
        isOpen={isOpen}
        toggle={toggleProjects}
      />

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="projects-content"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="mb-4 text-center text-gray-600 dark:text-gray-400">
              {t("projects.description")}
            </p>

            <div className="grid-responsive">
              <ProjectCard
                tKey="projects.acebury"
                frontImage={AceburyLogo}
                backImage={AceburyLogo2}
                link="#"
              />
              <ProjectCard
                tKey="projects.hotel"
                frontImage={Hotel}
                backImage={Hotel2}
                link="#"
              />
              <ProjectCard
                tKey="projects.epzn"
                frontImage={Bot}
                backImage={Bot2}
                link="#"
              />
              <ProjectCard
                tKey="projects.comingSoon"
                frontImage="/ruta/front.jpg"
                backImage="/ruta/back.jpg"
                link="#"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionWrapper>
  );
}

export default Projects;
