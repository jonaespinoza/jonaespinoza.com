import React, { useEffect, useState } from "react";
import Logo from "./Logo";
import MenuLinks from "./MenuLinks";
import ThemeToggle from "../ThemeToggle";
import LanguageToggle from "./LanguageToggle";

function Sidebar({ onLoginClick }) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

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

      {/* Toggle de tema e idioma al final */}
      <div className="flex items-center gap-2 mt-6">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </aside>
  );
}

export default Sidebar;
