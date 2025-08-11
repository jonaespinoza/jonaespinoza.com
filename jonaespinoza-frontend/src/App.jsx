// App.jsx
// Explicación:
// - Mantiene Layout como dueño del popup de login.
// - Home ("/") renderiza tus secciones como children de Layout.
// - /admin usa tu página Admin.jsx (que ya incluye Layout internamente).
// - Protegemos /admin con PrivateRoute (si no hay sesión, redirige a "/").

import { Routes, Route } from "react-router-dom";
import Layout from "./components/main/Layout";
import IntroImg from "./components/sections/IntroImg";
import AboutMe from "./components/sections/AboutMe";
import Projects from "./components/sections/Projects";
import Photos from "./components/sections/Photos";
import Blog from "./components/sections/Blog";
import Contact from "./components/sections/Contact";
import PrivateRoute from "./routes/PrivateRoute";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Layout>
            <IntroImg />
            <AboutMe />
            <Projects />
            <Photos />
            <Blog />
            <Contact />
          </Layout>
        }
      />

      <Route
        path="/admin"
        element={
          <PrivateRoute>
            {/* Admin.jsx ya incluye <Layout> por dentro, así evitamos doble Layout */}
            <Admin />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
