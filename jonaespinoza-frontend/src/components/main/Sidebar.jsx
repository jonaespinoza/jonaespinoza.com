import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "../ui/LanguageToggle";
//import { useAuth } from "../../context/AuthContext";
//import { useNavigate, useLocation } from "react-router-dom";
import { Bot } from "lucide-react";
import AdminButton from "../ui/AdminButton";

function Sidebar({ onLoginClick }) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  /*const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();*/

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const bgClass = isDark ? "bg-primary-dark" : "bg-primary";
  const borderClass = isDark ? "border-primary" : "border-primary-dark";

  /*const handleAdminClick = () => {
    if (isAuthenticated) navigate("/admin");
    else onLoginClick();
  };*/

  //const isActive = location.pathname === "/admin";

  return (
    <aside
      className={`hidden md:flex fixed top-0 left-0 h-screen w-64 ${bgClass} text-white border-r-2 ${borderClass} z-50 flex-col p-6 justify-between transition-colors duration-500`}
    >
      <div>
        <Logo />
        <div className="mt-6">
          <MenuLinks onClick={() => {}} onLoginClick={onLoginClick} />
        </div>
      </div>

      {/* Toggle de tema, idioma y robotito admin */}
      <div className="flex items-center gap-3 mt-6">
        <ThemeToggle />
        <LanguageToggle />
        <AdminButton onLoginClick={onLoginClick} />

        {/*<button
          onClick={handleAdminClick}
          title="Admin"
          aria-label="Admin"
          className={`text-white hover:text-accent transition-colors ${
            isActive ? "text-accent" : ""
          }`}
        >
          <Bot className="w-6 h-6" />
        </button>*/}
      </div>
    </aside>
  );
}

export default Sidebar;
