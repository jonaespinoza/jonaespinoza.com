// Qué es: Página de detalle de una foto (vista pública).
// Qué agregamos:
// - Controles admin (Editar, Ocultar/Mostrar, Visitar) visibles solo si hay token.
// - Callbacks listos para refrescar una vez que conectemos con la API.

import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import photosData from "../data/photosData";
import Layout from "../components/main/Layout";

// ⬇️ Controles admin (sin estilos)
import PhotoAdminControls from "../components/photos/PhotoAdminControls";

export default function PhotoDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [photo, setPhoto] = useState(null);
  const [zoom, setZoom] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const found = photosData.find((p) => p.id === id);
    setPhoto(found);
  }, [id]);

  if (!photo) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <p className="text-lg">{t("photos.notFound")}</p>
          <button
            onClick={() => navigate("/fotos")}
            className="mt-4 px-4 py-2 bg-gray-800 text-white rounded"
          >
            {t("photos.backToGallery")}
          </button>
        </div>
      </Layout>
    );
  }

  const photoKey = `photos.${photo.id}`;

  // ♻️ Cuando alternemos visibilidad desde el detalle, luego de conectar API,
  // acá podremos re-fetch del item. En mock no hacemos nada.
  const handleVisibilityChange = () => {
    // TODO: al conectar API, volver a pedir getPublic(id) o actualizar estado.
  };

  return (
    <Layout>
      {/* Botón volver (tu código) */}
      {!zoom && (
        <button
          onClick={() => navigate("/fotos")}
          className="text-2xl ml-6 cursor-pointer transition-transform duration-200 hover:-translate-x-1"
          aria-label={t("photos.backToGallery")}
        >
          ←
        </button>
      )}

      {/* 🔧 Controles admin en el detalle (sin estilos). 
          En mock usamos isVisible: true como placeholder. */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "8px 16px",
        }}
      >
        <PhotoAdminControls
          photo={{ id, isVisible: true /* TODO API */ }}
          variant="detail"
          onEdit={(pid) => navigate(`/fotos/${pid}/editar`)}
          onVisibilityChange={handleVisibilityChange}
          onVisit={(pid) => navigate(`/fotos/${pid}`)}
        />
      </div>

      {/* 🖼️ Contenedor de imagen con estilo tipo tarjeta */}
      <div className="flex justify-center mt-10">
        <div
          className="p-2 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-600
  bg-white/50 dark:bg-white/10 backdrop-blur-sm transition cursor-pointer hover:scale-[1.01] transition-transform duration-500"
          onClick={() => setZoom(true)}
        >
          <img
            src={photo.image}
            alt={t(photo.titleKey)}
            className="max-h-[70vh] max-w-full object-contain rounded-md"
          />
        </div>
      </div>

      {/* 🔍 Popup de zoom, con diseño coherente */}
      {zoom && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={() => setZoom(false)}
        >
          <div
            className="p-2 rounded-2xl shadow-2xl border border-gray-600 bg-white/5 dark:bg-white/5 backdrop-blur-md"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.image}
              alt={t(photo.titleKey)}
              className="object-contain rounded"
              style={{
                maxWidth: "calc(100vw - 4rem)",
                maxHeight: "calc(100vh - 4rem)",
              }}
            />
          </div>

          <button
            onClick={() => setZoom(false)}
            className="absolute top-6 right-6 text-white text-xl"
          >
            ✕
          </button>
        </div>
      )}

      {/* 📍 Footer con título e información */}
      <div className="w-full max-w-5xl mx-auto mt-6 flex items-center justify-between px-2">
        <h1 className="text-xl font-semibold">{t(photo.titleKey)}</h1>
        <div
          className="relative"
          onMouseEnter={() => setShowInfo(true)}
          onMouseLeave={() => setShowInfo(false)}
        >
          <div className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-300 text-sm font-bold cursor-pointer">
            i
          </div>
          {showInfo && (
            <div className="absolute right-0 mt-2 w-64 bg-white text-sm shadow-xl border rounded p-3 z-10 text-left text-black">
              <p>
                <strong>{t("photos.takenOn")}:</strong>{" "}
                {new Date(photo.takenDate).toLocaleDateString(i18n.language)}
              </p>
              <p>
                <strong>{t("photos.publishedOn")}:</strong>{" "}
                {new Date(photo.date).toLocaleDateString(i18n.language)}
              </p>
              {t(`${photoKey}.location`) && (
                <p>
                  <strong>{t("photos.location")}:</strong>{" "}
                  {t(`${photoKey}.location`)}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 📝 Descripción */}
      <div className="max-w-4xl mx-auto mt-4 px-2 text-lg leading-relaxed">
        {t(`${photoKey}.text`)}
      </div>

      {/* 🔙 Botón de volver final */}
      <div className="mt-10 mb-16 flex justify-center">
        <button
          onClick={() => navigate("/fotos")}
          className="px-6 py-2 bg-violet-700 text-white rounded hover:bg-violet-800 transition cursor-pointer"
        >
          {t("photos.backToGallery")}
        </button>
      </div>
    </Layout>
  );
}
