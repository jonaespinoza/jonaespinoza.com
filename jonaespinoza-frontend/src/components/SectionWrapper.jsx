import React from "react";
import { motion } from "framer-motion";
import Text from "./Text";

function SectionWrapper({ id, titleKey, contentKey, children }) {
  return (
    <section
      id={id}
      className="w-full py-20 bg-transparent border-t-2 border-primary-dark dark:border-primary"
    >
      <div className="max-w-6xl mx-auto px-4 md:px-12 text-center">
        {/* Título */}
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-4xl font-bold mb-8 text-primary-dark dark:text-accent"
        >
          <Text tKey={titleKey} />
        </motion.h2>

        {/* Descripción */}
        {contentKey && (
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg leading-relaxed max-w-3xl mx-auto"
          >
            <Text tKey={contentKey} />
          </motion.p>
        )}

        {/* Contenido adicional que quieras renderizar */}
        {children && <div className="mt-12">{children}</div>}
      </div>
    </section>
  );
}

export default SectionWrapper;
