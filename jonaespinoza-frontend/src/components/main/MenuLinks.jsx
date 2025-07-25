import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import NavText from "./NavText";

const sections = ["sobre-mi", "proyectos", "fotos", "juegos", "contacto"];

function MenuLinks({ onClick = () => {}, onLoginClick = () => {} }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState("");

  useEffect(() => {
    const handleScroll = () => {
      for (let id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(id);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleAnchorClick = (e, targetId) => {
    e.preventDefault();
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setTimeout(onClick, 300);
    }
  };

  const handleAdminClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) navigate("/admin");
    else onLoginClick();
    onClick();
  };

  const isRoute = (path) => location.pathname === path;

  return (
    <nav className="flex flex-col">
      {/* Ítem principal con subitems */}
      <div className="relative w-full">
        <a
          href="/"
          className={`block w-full border-t border-b border-gray-700 py-2 px-3 transition-all duration-200 ${
            isRoute("/")
              ? "text-gray-400 border-r-4 border-r-accent font-semibold"
              : "hover:text-accent"
          }`}
          onClick={onClick}
        >
          <NavText tKey="menu.home" />
        </a>

        {/* Ítems secundarios solo en ruta "/" */}
        {isRoute("/") && (
          <div className="mt-1 flex flex-col gap-1 text-sm">
            {sections.map((id) => (
              <a
                key={id}
                href={`#${id}`}
                onClick={(e) => handleAnchorClick(e, id)}
                className={`ml-4 py-1 px-2 transition-all duration-200 ${
                  activeSection === id
                    ? "text-accent font-medium"
                    : "hover:text-accent"
                }`}
              >
                <NavText tKey={`menu.${id}`} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Ítems principales restantes */}
      {[
        { href: "/blog", key: "menu.blog" },
        { href: "/acebury", key: "menu.acebury" },
      ].map(({ href, key }) => (
        <a
          key={key}
          href={href}
          className={`block w-full border-t border-b border-gray-700 py-2 px-3 transition-all duration-200 ${
            isRoute(href)
              ? "text-gray-400 border-r-4 border-r-accent font-semibold"
              : "hover:text-accent"
          }`}
          onClick={onClick}
        >
          <NavText tKey={key} />
        </a>
      ))}

      <a
        href="/admin"
        className={`block w-full border-t border-b border-gray-700 py-2 px-3 transition-all duration-200 ${
          isRoute("/admin")
            ? "text-gray-400 border-r-4 border-r-accent font-semibold"
            : "hover:text-accent"
        }`}
        onClick={handleAdminClick}
      >
        <NavText tKey="menu.admin" />
      </a>
    </nav>
  );
}

export default MenuLinks;
