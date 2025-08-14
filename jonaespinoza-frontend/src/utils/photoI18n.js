// Qué es: Helper para elegir el texto correcto (ES/EN) en campos de Photo.
// Qué hacemos: si el idioma activo es "en", usamos <campo>_en; si no existe,
// caemos al campo base (ES) y marcamos notTranslated=true para que el componente
// pueda mostrar el aviso "Not translated" (localizable con t("photos.notTranslated")).
// Preparado para futuro: fácil de extender si agregás más idiomas.

export function getPhotoField(photo = {}, field = "", lang = "es") {
  if (!photo || !field) return { text: "", notTranslated: false };

  // Español → devolvemos el campo base sin marca
  if (lang.startsWith("es")) {
    return { text: photo[field] || "", notTranslated: false };
  }

  // Inglés → priorizamos *_en; si no hay, usamos ES con marca
  if (lang.startsWith("en")) {
    const en = photo[`${field}_en`];
    if (typeof en === "string" && en.trim().length > 0) {
      return { text: en, notTranslated: false };
    }
    return { text: photo[field] || "", notTranslated: true };
  }

  // Otros idiomas → por ahora caemos a ES con marca
  return { text: photo[field] || "", notTranslated: true };
}

export function composeLocalizedText(photo, field, lang, t) {
  // Qué es: arma el string final y agrega " — Not translated" cuando hace falta.
  const { text, notTranslated } = getPhotoField(photo, field, lang);
  if (!notTranslated) return text;
  const label = (t && t("photos.notTranslated")) || "Not translated";
  return text ? `${text} — ${label}` : label;
}
