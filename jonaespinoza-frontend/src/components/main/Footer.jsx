import React from "react";

export default function Footer() {
  const icons = [
    { src: "", alt: "Twitter", link: "#" },
    { src: "", alt: "Instagram", link: "#" },
    { src: "", alt: "TikTok", link: "#" },
    { src: "", alt: "Spotify", link: "#" },
    { src: "", alt: "LinkedIn", link: "#" },
  ];

  return (
    <footer className="w-full bg-gray-800 py-6 mt-16">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-6 gap-6">
        {/* 🄰 Derechos de autor */}
        <div className="text-center text-sm text-gray-700 dark:text-gray-300 w-full md:w-1/2">
          © {new Date().getFullYear()} Jonathan Espinoza. All rights reserved.
        </div>

        {/* 🌐 Iconos de redes */}
        <div className="flex justify-center gap-5 w-full md:w-1/2">
          {icons.map(({ src, alt, link }) => (
            <a
              key={alt}
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform duration-200 hover:scale-110"
            >
              <img src={src} alt={alt} className="w-6 h-6" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
