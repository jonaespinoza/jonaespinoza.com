import React from "react";
import SectionWrapper from "./SectionWrapper";

function AboutMe() {
  return (
    <SectionWrapper
      id="sobre-mi"
      titleKey="about.title"
      contentKey="about.content"
    >
      {/* Si más adelante querés agregar más contenido en Sobre mí, lo agregás acá como children */}
    </SectionWrapper>
  );
}

export default AboutMe;
