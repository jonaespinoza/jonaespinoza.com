import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MobileNavbar from "./MobileNavbar";
import Overlay from "./Overlay";
import ChatButton from "./ChatButton";
import Login from "../../pages/Login";
import LanguageNotice from "./LanguageNotice";
import Footer from "./Footer";
import Loader from "./Loader";

function Layout({ children }) {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  // Convertimos `children` en array para poder separar
  const childrenArray = React.Children.toArray(children);
  const firstSection = childrenArray[0]; // IntroImg
  const rest = childrenArray.slice(1); // El resto del contenido

  return (
    <>
      <Loader />
      <Overlay visible={maintenanceMode} />

      <MobileNavbar onLoginClick={() => setShowLogin(true)} />

      <div className="flex transition-opacity duration-500">
        <Sidebar onLoginClick={() => setShowLogin(true)} />

        <main className="flex-1 ml-0 md:ml-64">
          {/* IntroImg sin padding ni separación arriba */}
          {firstSection}

          {/* Resto con padding y separación */}
          <div className="pt-20 md:pt-6 px-6 md:px-6">{rest}</div>

          <Footer />
        </main>
      </div>

      <ChatButton />

      <LanguageNotice />

      {showLogin && <Login onClose={() => setShowLogin(false)} />}
    </>
  );
}

export default Layout;
