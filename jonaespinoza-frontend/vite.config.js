// Qué es: Config de Vite.
// Qué hacemos: agregamos un proxy para /uploads hacia el backend en dev,
// para que el navegador las vea como mismo origen (5173) y evitemos CSP cruzada.
// Preparado para futuro: si cambiás el puerto del back, solo actualizás 'target'.

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      // En dev: cualquier request a /uploads/* se proxyea al backend
      "/uploads": {
        target: "http://localhost:4000", // back
        changeOrigin: true,
        // opcional: si tu back sirve /uploads ya en raíz, no hagas rewrite
        // rewrite: (path) => path, // identidad
      },
    },
  },
});
