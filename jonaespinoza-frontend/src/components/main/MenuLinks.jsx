import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavText from "./NavText";

const menuItems = [
  { id: "sobre-mi", label: "menu.sobre-mi" },
  { id: "proyectos", label: "menu.proyectos" },
  { id: "fotos", label: "menu.fotos", page: "/fotos" },
  { id: "blog", label: "menu.blog", page: "/blog" },
  { id: "contacto", label: "menu.contacto" },
];

function MenuLinks({ onClick = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  // Trackea el scroll SOLO en home
  useEffect(() => {
    if (location.pathname !== "/") return;
    const handleScroll = () => {
      for (let item of menuItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      setActiveSection("");
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  // Handler click menú
  const handleMenuClick = (e, item) => {
    e.preventDefault();

    // En HOME: SIEMPRE scroll (aunque sea fotos o blog)
    if (location.pathname === "/") {
      const el = document.getElementById(item.id);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    } else {
      // En OTRA PAGE
      if (item.page && location.pathname.startsWith(item.page)) {
        // Si ya estoy en la page, solo navego al inicio
        navigate(item.page);
      } else if (item.page) {
        // Si no estoy, navego a esa page
        navigate(item.page);
      } else {
        // Los demás, navegan al home y scrollean
        navigate(`/#${item.id}`);
        setTimeout(() => {
          const el = document.getElementById(item.id);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 350);
      }
    }
    onClick();
  };

  // Resalta en home según sección, y en page según ruta
  const isActive = (item) => {
    if (location.pathname === "/") {
      return activeSection === item.id;
    }
    if (item.page && location.pathname.startsWith(item.page)) {
      return true;
    }
    return false;
  };

  return (
    <nav className="flex flex-col">
      {menuItems.map((item) => (
        <a
          key={item.id}
          href={
            location.pathname === "/"
              ? `#${item.id}`
              : item.page || `/#${item.id}`
          }
          onClick={(e) => handleMenuClick(e, item)}
          className={`block w-full border-accent py-2 px-3 transition-all duration-200 ${
            isActive(item)
              ? "text-gray-400 border-r-4 border-r-accent font-semibold"
              : "hover:text-accent"
          }`}
        >
          <NavText tKey={item.label} />
        </a>
      ))}
    </nav>
  );
}

export default MenuLinks;
