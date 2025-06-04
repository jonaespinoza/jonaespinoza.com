import Layout from "../components/main/Layout";
import { useAuth } from "../context/AuthContext";

function Admin() {
  const { user, logout } = useAuth();

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-4">Bienvenido, {user.username}</h1>
      <p>Este es el panel de administración.</p>

      <button
        onClick={logout}
        className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Cerrar sesión
      </button>
    </Layout>
  );
}

export default Admin;
