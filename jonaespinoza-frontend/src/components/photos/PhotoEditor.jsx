// src/components/photos/PhotoEditor.jsx
// -----------------------------------------------------------------------------------------
// Form unificado para Crear/Editar fotos.
// - En "create": exige archivo, manda multipart { image, metadata(JSON) } -> photosServices.create()
// - En "edit": si hay file manda multipart, si no manda solo metadata -> photosServices.update(id)
// - takenDate usa input type=date (YYYY-MM-DD) y lo pasa tal cual al backend
// - Soporta initialData con id o _id
// -----------------------------------------------------------------------------------------

import { useEffect, useMemo, useState } from "react";
import {
  create as createPhoto,
  update as updatePhoto,
} from "../../services/photosServices";
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
    // Acepta Date, string ISO o "YYYY-MM-DD"
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

  // ---------- Form state ----------
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
    // por seguridad: si no viene nada en edición, default true para contenido nuevo
    mode === "create" ? true : Boolean(initialData?.isVisible)
  );
  const [file, setFile] = useState(null);

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
      };

      const saved =
        mode === "create"
          ? await createPhoto({ metadata, file })
          : await updatePhoto(photoId, { metadata, file: file || undefined });

      onSaved?.(saved);

      // en creación, limpiar el form para poder cargar otra rápido
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
      }
    } catch (err) {
      // muestra mensaje del backend si vino en JSON: { message } o { error }
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
