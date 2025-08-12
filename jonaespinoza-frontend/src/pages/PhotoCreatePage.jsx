// D:\Jona\Programacion\jonaespinoza.com\jonaespinoza-frontend\src\pages\PhotoCreatePage.jsx
// -----------------------------------------------------------------------------------------
// Qué es: Página de "Agregar Nueva Foto" en /fotos/agregarfoto.
// Qué hace: Renderiza PhotoEditor en modo "create" y navega de vuelta a /fotos al guardar.
// -----------------------------------------------------------------------------------------
import { useNavigate } from "react-router-dom";
import Layout from "../components/main/Layout";
import PhotoEditor from "../components/photos/PhotoEditor";

export default function PhotoCreatePage() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
        <h1>Agregar Nueva Foto</h1>
        <PhotoEditor
          mode="create"
          onCancel={() => navigate("/fotos")}
          onSaved={() => navigate("/fotos")}
        />
      </div>
    </Layout>
  );
}
