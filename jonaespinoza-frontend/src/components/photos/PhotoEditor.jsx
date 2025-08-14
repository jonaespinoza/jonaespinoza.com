// Qué es: Form unificado para Crear/Editar fotos.
// Qué hacemos: agregamos campos EN opcionales (title_en, subtitle_en, descriptionMd_en, location_en)
// y los enviamos en metadata tanto en create como en update. Mantiene tu validación y UX.
// Comentarios explican cada paso. No agrego clases Tailwind nuevas.

import { useEffect, useMemo, useState } from "react";
import {
  create as createPhoto,
  update as updatePhoto,
} from "../../services/photosServices"; // ⚠️ import del servicio en singular
import { useAuth } from "../../context/AuthContext";

export default function PhotoEditor({
  mode = "create", // "create" | "edit"
  initialData = null, // { id/_id, title, ... }
  onCancel,
  onSaved,
}) {
  const { isAuthenticated } = useAuth();

  // ---------- Helpers ----------
  const photoId = initialData?.id || initialData?._id || null;
  const isoToYMD = (iso) => {
    if (!iso) return "";
    try {
      if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      const y = d.getUTCFullYear();
      const m = String(d.getUTCMonth() + 1).padStart(2, "0");
      const day = String(d.getUTCDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    } catch {
      return "";
    }
  };

  // ---------- Form state (ES) ----------
  const [title, setTitle] = useState(initialData?.title || "");
  const [subtitle, setSubtitle] = useState(initialData?.subtitle || "");
  const [descriptionMd, setDescriptionMd] = useState(
    initialData?.descriptionMd || ""
  );
  const [alt, setAlt] = useState(initialData?.alt || "");
  const [location, setLocation] = useState(initialData?.location || "");
  const [takenDate, setTakenDate] = useState(isoToYMD(initialData?.takenDate));
  const [tagsStr, setTagsStr] = useState(
    Array.isArray(initialData?.tags) ? initialData.tags.join(", ") : ""
  );
  const [featured, setFeatured] = useState(Boolean(initialData?.featured));
  const [isVisible, setIsVisible] = useState(
    mode === "create" ? true : Boolean(initialData?.isVisible)
  );
  const [file, setFile] = useState(null);

  // ---------- Form state (EN opcional) ----------
  const [titleEn, setTitleEn] = useState(initialData?.title_en || "");
  const [subtitleEn, setSubtitleEn] = useState(initialData?.subtitle_en || "");
  const [descriptionMdEn, setDescriptionMdEn] = useState(
    initialData?.descriptionMd_en || ""
  );
  const [locationEn, setLocationEn] = useState(initialData?.location_en || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(initialData?.imageUrl || "");

  // tags: CSV -> array limpios
  const tags = useMemo(
    () =>
      tagsStr
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 10),
    [tagsStr]
  );

  // preview de imagen nueva
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // ---------- Validación básica ----------
  const validate = () => {
    if (!title.trim()) return "El título es requerido.";
    if (!descriptionMd.trim()) return "La descripción es requerida.";
    if (mode === "create" && !file) return "Debés seleccionar una imagen.";
    if (takenDate && !/^\d{4}-\d{2}-\d{2}$/.test(takenDate))
      return "La fecha debe tener formato YYYY-MM-DD.";
    if (tags.some((t) => t.length > 30))
      return "Cada tag debe tener hasta 30 caracteres.";
    return null;
  };

  // ---------- Submit ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isAuthenticated) {
      setError("No estás autenticado.");
      return;
    }
    const v = validate();
    if (v) {
      setError(v);
      return;
    }

    setSaving(true);
    try {
      // Metadata: mantenemos ES como base y añadimos EN si se completó
      const metadata = {
        title: title.trim(),
        subtitle: subtitle.trim() || undefined,
        descriptionMd: descriptionMd.trim(),
        alt: (alt || title).trim(),
        location: location.trim() || undefined,
        takenDate: takenDate || undefined, // el backend hace new Date(takenDate)
        tags,
        featured: Boolean(featured),
        isVisible: Boolean(isVisible),

        // 👉 Campos EN opcionales (el back puede ignorar vacíos)
        title_en: titleEn.trim() || undefined,
        subtitle_en: subtitleEn.trim() || undefined,
        descriptionMd_en: descriptionMdEn.trim() || undefined,
        location_en: locationEn.trim() || undefined,
      };

      const saved =
        mode === "create"
          ? await createPhoto({ metadata, file }) // ⬅️ AQUÍ usamos photosService.create
          : await updatePhoto(photoId, { metadata, file: file || undefined });

      onSaved?.(saved);

      // en creación, limpiar para carga rápida de otra foto
      if (mode === "create") {
        setTitle("");
        setSubtitle("");
        setDescriptionMd("");
        setAlt("");
        setLocation("");
        setTakenDate("");
        setTagsStr("");
        setFeatured(false);
        setIsVisible(true);
        setFile(null);
        setPreview("");

        // limpiar EN
        setTitleEn("");
        setSubtitleEn("");
        setDescriptionMdEn("");
        setLocationEn("");
      }
    } catch (err) {
      setError(err?.message || "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  // ---------- UI ----------
  if (!isAuthenticated) {
    return <p>Necesitás estar logueado como admin para usar el editor.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3">
      {error && (
        <div role="alert" className="text-red-500">
          {error}
        </div>
      )}

      {/* --- Español (base) --- */}
      <label className="grid gap-1">
        <span>Título*</span>
        <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span>Subtítulo</span>
        <input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
      </label>

      <label className="grid gap-1">
        <span>Descripción (Markdown)*</span>
        <textarea
          rows={8}
          value={descriptionMd}
          onChange={(e) => setDescriptionMd(e.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span>Texto alternativo (alt)</span>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          placeholder="Si queda vacío, se usará el título"
        />
      </label>

      <label className="grid gap-1">
        <span>Ubicación</span>
        <input value={location} onChange={(e) => setLocation(e.target.value)} />
      </label>

      {/* --- Inglés (opcional) --- */}
      <fieldset className="grid gap-2">
        <legend>English (opcional)</legend>

        <label className="grid gap-1">
          <span>Title (EN)</span>
          <input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
        </label>

        <label className="grid gap-1">
          <span>Subtitle (EN)</span>
          <input
            value={subtitleEn}
            onChange={(e) => setSubtitleEn(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span>Description (EN, Markdown)</span>
          <textarea
            rows={6}
            value={descriptionMdEn}
            onChange={(e) => setDescriptionMdEn(e.target.value)}
          />
        </label>

        <label className="grid gap-1">
          <span>Location (EN)</span>
          <input
            value={locationEn}
            onChange={(e) => setLocationEn(e.target.value)}
          />
        </label>
      </fieldset>

      {/* --- Resto de campos --- */}
      <label className="grid gap-1">
        <span>Fecha en que se tomó</span>
        <input
          type="date"
          value={takenDate}
          onChange={(e) => setTakenDate(e.target.value)}
        />
      </label>

      <label className="grid gap-1">
        <span>Tags (separados por coma)</span>
        <input
          value={tagsStr}
          onChange={(e) => setTagsStr(e.target.value)}
          placeholder="viaje, paisaje, nocturna"
        />
        <small className="opacity-70">{tags.length}/10</small>
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={featured}
          onChange={(e) => setFeatured(e.target.checked)}
        />
        <span>Destacada</span>
      </label>

      <label className="inline-flex items-center gap-2">
        <input
          type="checkbox"
          checked={isVisible}
          onChange={(e) => setIsVisible(e.target.checked)}
        />
        <span>Visible al público</span>
      </label>

      <label className="grid gap-1">
        <span>
          Imagen{" "}
          {mode === "create" ? "(requerida)" : "(opcional para reemplazar)"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </label>

      {preview && (
        <div className="grid gap-1">
          <span>Vista previa:</span>
          <img
            src={preview}
            alt="preview"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>
      )}

      <div className="flex gap-2">
        <button type="submit" disabled={saving}>
          {saving
            ? "Guardando..."
            : mode === "create"
            ? "Crear"
            : "Guardar cambios"}
        </button>
        <button
          type="button"
          onClick={() => !saving && onCancel?.()}
          disabled={saving}
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
