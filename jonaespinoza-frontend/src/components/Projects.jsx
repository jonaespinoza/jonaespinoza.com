import SectionWrapper from "./SectionWrapper";
import ProjectCard from "./ProjectCard";
import AceburyLogo from "../assets/aceburylogo.png";
import AceburyLogo2 from "../assets/aceburylogo2.png";
import Hotel from "../assets/hotel.png";
import Hotel2 from "../assets/hotel2.png";
import Bot from "../assets/bot.png";
import Bot2 from "../assets/bot2.png";

function Projects() {
  return (
    <SectionWrapper
      id="proyectos"
      titleKey="projects.title"
      contentKey="projects.description"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProjectCard
          tKey=""
          frontImage={AceburyLogo}
          backImage={AceburyLogo2}
          link="#"
        />

        <ProjectCard tKey="" frontImage={Hotel} backImage={Hotel2} link="#" />

        <ProjectCard tKey="" frontImage={Bot} backImage={Bot2} link="#" />

        <ProjectCard
          tKey="projects.comingSoon"
          frontImage="/ruta/front.jpg"
          backImage="/ruta/back.jpg"
          link="#"
        />
      </div>
    </SectionWrapper>
  );
}

export default Projects;
