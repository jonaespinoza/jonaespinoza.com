import SectionWrapper from "../main/SectionWrapper";
import FadeCarousel from "../FadeCarousel";
import Text from "../main/Text"; // ⚠️ Importamos el componente animado

export default function Contact() {
  const carouselItems = [
    <img
      src="/img/youtube.jpg"
      alt="YouTube"
      className="w-full h-full object-cover rounded-xl"
    />,
    <img
      src="/img/linkedin.jpg"
      alt="LinkedIn"
      className="w-full h-full object-cover rounded-xl"
    />,
    <img
      src="/img/tiktok.jpg"
      alt="TikTok"
      className="w-full h-full object-cover rounded-xl"
    />,
  ];

  return (
    <SectionWrapper
      id="contacto"
      titleKey="contact.title"
      contentKey="contact.description"
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* 📬 FORMULARIO - ocupa 3/4 en desktop */}
        <form className="lg:col-span-3 space-y-4 sm:space-y-6">
          {/* Nombre */}
          <div>
            <label className="block font-medium mb-2">
              <Text tKey="contact.name" as="span" /> *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus-visible:focus-visible focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Mail */}
          <div>
            <label className="block font-medium mb-2">
              <Text tKey="contact.email" as="span" /> *
            </label>
            <input
              type="email"
              required
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus-visible:focus-visible focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block font-medium mb-2">
              <Text tKey="contact.phone" as="span" />
            </label>
            <input
              type="tel"
              maxLength={50}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus-visible:focus-visible focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* País */}
          <div>
            <label className="block font-medium mb-2">
              <Text tKey="contact.country" as="span" /> *
            </label>
            <input
              type="text"
              required
              maxLength={100}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 dark:bg-gray-800 dark:text-white dark:border-gray-600 focus-visible:focus-visible focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Mensaje */}
          <div>
            <label className="block font-medium mb-2">
              <Text tKey="contact.message" as="span" /> *
            </label>
            <textarea
              required
              maxLength={500}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none dark:bg-gray-800 dark:text-white dark:border-gray-600 focus-visible:focus-visible focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            className="px-8 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-300 focus-visible:focus-visible focus:ring-2 focus:ring-accent"
          >
            <Text tKey="contact.send" as="span" />
          </button>
        </form>

        {/* 🖼️ REDES - ocupa 1/4 en desktop */}
        <div className="w-full h-full">
          <FadeCarousel items={carouselItems} className="h-64 lg:h-full" />
        </div>
      </div>
    </SectionWrapper>
  );
}
