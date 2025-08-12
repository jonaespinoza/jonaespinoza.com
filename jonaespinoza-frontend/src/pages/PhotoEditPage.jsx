// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\pages\PhotoEditPage.jsx
// -----------------------------------------------------------------------------------------
// Qué es: Página de edición en /fotos/:id/editar.
// Qué hace:
//  - Al montar, intenta cargar datos actuales para prellenar el formulario.
//  - Usa la API admin si querés (GET admin por id), pero como no definimos ese endpoint,
//    por ahora levantamos el detalle público si existe y lo adaptamos (id, imageUrl, ...).
//  - En un próximo paso, podemos agregar GET admin by id para ver ocultas/archivadas.
// -----------------------------------------------------------------------------------------
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/main/Layout";
import PhotoEditor from "../components/photos/PhotoEditor";
import { getPublic } from "../services/photosServices";

export default function PhotoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [initialData, setInitialData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // ⚠️ Nota: getPublic solo devuelve visibles. Si necesitás editar una oculta/archivada,
    // creamos un GET admin by id. Por ahora usamos lo público para prellenar cuando se pueda.
    (async () => {
      setLoading(true);
      setError("");
      try {
        const p = await getPublic(id);
        // Adaptamos al shape del editor
        setInitialData({
          id: p.id,
          title: p.title || "",
          subtitle: p.subtitle || "",
          descriptionMd: p.descriptionMd || "",
          alt: p.alt || "",
          location: p.location || "",
          takenDate: p.takenDate || "",
          tags: Array.isArray(p.tags) ? p.tags : [],
          featured: Boolean(p.featured),
          isVisible: Boolean(p.isVisible),
          imageUrl: p.imageUrl || "",
        });
      } catch (e) {
        setError("No se pudo cargar la foto para editar.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
          Cargando…
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div
          style={{ maxWidth: 900, margin: "0 auto", padding: 16, color: "red" }}
        >
          {error}
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1>Editar Foto</h1>
        <PhotoEditor
          mode="edit"
          initialData={initialData}
          onCancel={() => navigate("/fotos")}
          onSaved={() => navigate(`/fotos/${id}`)}
        />
      </div>
    </Layout>
  );
}
