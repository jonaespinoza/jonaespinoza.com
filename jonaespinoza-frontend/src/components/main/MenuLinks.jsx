import React from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import NavText from "./NavText";

function MenuLinks({ onClick = () => {}, onLoginClick = () => {} }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // 🔁 Click con scroll suave y cierre del menú después
  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(onClick, 300); // Esperamos a que scrollee antes de cerrar
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) navigate("/admin");
    else onLoginClick();
    onClick();
  };

  return (
    <nav className="flex flex-col gap-2">
      <a href="/" className="hover:text-accent font-semibold" onClick={onClick}>
        <NavText tKey="menu.home" />
      </a>

      <div className="ml-4 flex flex-col gap-2 text-sm text-gray-300">
        <a
          href="#sobre-mi"
          onClick={(e) => handleAnchorClick(e, "sobre-mi")}
          className="hover:text-accent"
        >
          <NavText tKey="menu.about" />
        </a>
        <a
          href="#proyectos"
          onClick={(e) => handleAnchorClick(e, "proyectos")}
          className="hover:text-accent"
        >
          <NavText tKey="menu.projects" />
        </a>
        <a
          href="#fotos"
          onClick={(e) => handleAnchorClick(e, "fotos")}
          className="hover:text-accent"
        >
          <NavText tKey="menu.photos" />
        </a>
        <a
          href="#juegos"
          onClick={(e) => handleAnchorClick(e, "juegos")}
          className="hover:text-accent"
        >
          <NavText tKey="menu.games" />
        </a>
        <a
          href="#contacto"
          onClick={(e) => handleAnchorClick(e, "contacto")}
          className="hover:text-accent"
        >
          <NavText tKey="menu.contact" />
        </a>
      </div>

      <a href="/blog" className="hover:text-accent mt-4" onClick={onClick}>
        <NavText tKey="menu.blog" />
      </a>
      <a href="/acebury" className="hover:text-accent" onClick={onClick}>
        <NavText tKey="menu.acebury" />
      </a>
      <a href="/admin" className="hover:text-accent" onClick={handleAdminClick}>
        <NavText tKey="menu.admin" />
      </a>
    </nav>
  );
}

export default MenuLinks;
