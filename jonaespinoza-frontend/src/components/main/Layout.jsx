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
  const [showLogin, setShowLogin] = useState(false);

  // Convertimos `children` en array para poder separar
  const childrenArray = React.Children.toArray(children);
  const firstSection = childrenArray[0]; // IntroImg
  const rest = childrenArray.slice(1); // El resto del contenido

  return (
    <>
      <Loader />
      <Overlay visible={false} />

      <MobileNavbar onLoginClick={() => setShowLogin(true)} />

      <div className="flex transition-all duration-300">
        <Sidebar onLoginClick={() => setShowLogin(true)} />

        <main className="flex-1 ml-0 md:ml-64 min-h-screen transition-all duration-300">
          {/* IntroImg sin padding ni separación arriba */}
          {firstSection}

          {/* Resto con padding y separación mejorada */}
          <div className="pt-16 md:pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto transition-all duration-300">
            {rest}
          </div>

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
