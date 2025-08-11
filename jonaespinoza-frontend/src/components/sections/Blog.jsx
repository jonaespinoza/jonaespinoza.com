import React from "react";
import SectionWrapper from "../main/SectionWrapper";

function Blog() {
  return (
    <SectionWrapper
      id="blog"
      titleKey="blog.title"
      contentKey="blog.description"
    >
      {/* Si más adelante querés agregar más contenido en Sobre mí, lo agregás acá como children */}
    </SectionWrapper>
  );
}

export default Blog;
