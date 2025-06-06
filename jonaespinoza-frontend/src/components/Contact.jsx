import { useTranslation } from "react-i18next";
import SectionWrapper from "./SectionWrapper";
import FadeCarousel from "./FadeCarousel";

export default function Contact() {
  const { t } = useTranslation();

  const carouselItems = [
    <img src="/img/youtube.jpg" alt="YouTube" className="w-full h-full object-cover rounded-xl" />,
    <img src="/img/linkedin.jpg" alt="LinkedIn" className="w-full h-full object-cover rounded-xl" />,
    <img src="/img/tiktok.jpg" alt="TikTok" className="w-full h-full object-cover rounded-xl" />,
  ];

  return (
    <SectionWrapper
      id="contacto"
      titleKey="contact.title"
      contentKey="contact.description"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 📬 FORMULARIO - ocupa 3/4 en desktop */}
        <form className="lg:col-span-3 space-y-4">
          {/* Nombre */}
          <div>
            <label className="block font-medium">{t("contact.name")} *</label>
            <input
              type="text"
              required
              maxLength={100}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Mail */}
          <div>
            <label className="block font-medium">{t("contact.email")} *</label>
            <input
              type="email"
              required
              maxLength={100}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block font-medium">{t("contact.phone")}</label>
            <input
              type="tel"
              maxLength={50}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* País */}
          <div>
            <label className="block font-medium">{t("contact.country")} *</label>
            <input
              type="text"
              required
              maxLength={100}
              className="w-full border rounded px-3 py-2 dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block font-medium">{t("contact.message")} *</label>
            <textarea
              required
              maxLength={500}
              className="w-full border rounded px-3 py-2 h-32 resize-none dark:bg-gray-800 dark:text-white"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="px-6 py-2 bg-violet-700 text-white rounded hover:bg-violet-800 transition"
          >
            {t("contact.send")}
          </button>
        </form>

        {/* 🖼️ REDES - ocupa 1/4 en desktop */}
        <div className="w-full h-full">
          <FadeCarousel items={carouselItems} className="h-64" />
        </div>
      </div>
    </SectionWrapper>
  );
}
