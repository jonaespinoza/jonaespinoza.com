// Qué es: Página de detalle de foto con tu estilo original (hover, zoom, tamaño normalizado).
// Qué hacemos: Conectamos al backend (getPublic + visit), normalizamos la URL de la imagen
// para dev/prod, resolvemos textos ES/EN con fallback y mantenemos flecha y botón de volver.
// Comentarios explican cada paso clave. No agrego clases Tailwind nuevas.

import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useRef, useState } from "react";
import Layout from "../components/main/Layout";

// ⚠️ Import correcto del servicio (singular) y helpers
import photosService from "../services/photosServices";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import { composeLocalizedText } from "../utils/photoI18n";

export default function PhotoDetail() {
  // 1) Router e i18n
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // 2) Estado de datos y UI
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // UI de la imagen (como tenías): zoom + tooltip "i"
  const [zoom, setZoom] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // 3) Evitar sumar visitas múltiples si re-renderiza
  const visitedRef = useRef(false);

  // 4) Fetch detalle desde el backend
  useEffect(() => {
    let cancel = false;
    async function fetchDetail() {
      try {
        setLoading(true);
        setError("");
        const data = await photosService.getPublic(id); // GET /api/public/photos/:id
        if (cancel) return;
        setPhoto(data || null);
      } catch (e) {
        if (cancel) return;
        setError(e.message || "Error al cargar la foto");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    fetchDetail();
    return () => {
      cancel = true;
    };
  }, [id]);

  // 5) Sumar visita una sola vez cuando tenemos la foto
  useEffect(() => {
    if (!photo || visitedRef.current) return;
    visitedRef.current = true;
    photosService.visit(photo.id).catch(() => {
      // silencioso; podríamos monitorear métricas en otra fase
    });
  }, [photo]);

  // 6) Adaptadores: URL de imagen y textos localizados (con fallback)
  const imageSrc = useMemo(
    () => resolveImageUrl(photo?.imageUrl || ""),
    [photo]
  );

  // Campos localizados con fallback ES + "Not translated" en EN si falta
  const title = useMemo(
    () => composeLocalizedText(photo || {}, "title", i18n.language, t),
    [photo, i18n.language, t]
  );
  const subtitle = useMemo(
    () => composeLocalizedText(photo || {}, "subtitle", i18n.language, t),
    [photo, i18n.language, t]
  );
  const descriptionMd = useMemo(
    () => composeLocalizedText(photo || {}, "descriptionMd", i18n.language, t),
    [photo, i18n.language, t]
  );
  const locationText = useMemo(
    () => composeLocalizedText(photo || {}, "location", i18n.language, t),
    [photo, i18n.language, t]
  );

  const takenDate = photo?.takenDate ? new Date(photo.takenDate) : null;
  const uploadedDate = photo?.uploadedDate
    ? new Date(photo.uploadedDate)
    : null;

  // 7) Estados de error / no encontrado
  if (!loading && (!photo || error)) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <p className="text-lg">{error || t("photos.notFound")}</p>
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

  return (
    <Layout>
      {/* Flecha/botón de volver arriba-izquierda (tu estilo) */}
      {!zoom && (
        <button
          onClick={() => navigate("/fotos")}
          className="text-2xl ml-6 cursor-pointer transition-transform duration-200 hover:-translate-x-1"
          aria-label={t("photos.backToGallery")}
        >
          ←
        </button>
      )}

      {/* 🖼️ Contenedor de imagen con TU estilo original (hover + scale + blur + border) */}
      {!loading && photo && (
        <div className="flex justify-center mt-10">
          <div
            className="p-2 rounded-2xl shadow-xl border border-gray-300 dark:border-gray-600
  bg-white/50 dark:bg-white/10 backdrop-blur-sm transition cursor-pointer hover:scale-[1.01] transition-transform duration-500"
            onClick={() => setZoom(true)}
          >
            <img
              src={imageSrc}
              alt={title || "Foto"}
              className="max-h-[70vh] max-w-full object-contain rounded-md"
            />
          </div>
        </div>
      )}

      {/* 🔍 Popup de zoom centrado */}
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
              src={imageSrc}
              alt={title || "Foto"}
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

      {/* 📍 Footer con Título + Info (icono "i" con hover) */}
      {!loading && photo && (
        <div className="w-full max-w-5xl mx-auto mt-6 flex items-center justify-between px-2">
          <div>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle && <p className="mt-1">{subtitle}</p>}
          </div>

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
                {takenDate && (
                  <p>
                    <strong>{t("photos.takenOn")}:</strong>{" "}
                    {takenDate.toLocaleDateString(i18n.language)}
                  </p>
                )}
                {uploadedDate && (
                  <p>
                    <strong>{t("photos.publishedOn")}:</strong>{" "}
                    {uploadedDate.toLocaleDateString(i18n.language)}
                  </p>
                )}
                {locationText && (
                  <p>
                    <strong>{t("photos.location")}:</strong> {locationText}
                  </p>
                )}
                <p>
                  <strong>👁️</strong> {photo.visits ?? 0}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 📝 Descripción (texto plano respetando saltos de línea) */}
      {!loading && photo && (
        <div className="max-w-4xl mx-auto mt-4 px-2 text-lg leading-relaxed whitespace-pre-line">
          {descriptionMd}
        </div>
      )}

      {/* 🔙 Botón de volver final (el “botón nuevo” que querías mantener) */}
      {!loading && (
        <div className="mt-10 mb-16 flex justify-center">
          <button
            onClick={() => navigate("/fotos")}
            className="px-6 py-2 bg-violet-700 text-white rounded hover:bg-violet-800 transition cursor-pointer"
          >
            {t("photos.backToGallery")}
          </button>
        </div>
      )}
    </Layout>
  );
}
