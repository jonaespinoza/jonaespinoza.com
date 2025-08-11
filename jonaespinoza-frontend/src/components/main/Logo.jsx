import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Logo() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (e) => {
    e.preventDefault();

    if (location.pathname === "/") {
      // Si ya estamos en la página principal, scrolleamos arriba
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      // Si no, navegamos al home
      navigate("/");
    }
  };

  return (
    <div
      onClick={handleClick}
      className="flex items-center space-x-2 cursor-pointer"
    >
      {/* Acá eventualmente podés usar un <img src="..." /> */}
      <span className="text-xl font-bold text-white">jonaespinoza.com</span>
    </div>
  );
}

export default Logo;
