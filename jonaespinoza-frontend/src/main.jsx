import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import "./i18n"; // 👈 Agregamos esto

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./routes/PrivateRoute";
import Admin from "./pages/Admin";
import Login from "./pages/Login";
import PhotoPage from "./pages/PhotoPage";
import PhotoDetail from "./pages/PhotoDetail";
import PhotoCreatePage from "./pages/PhotoCreatePage";
import PhotoEditPage from "./pages/PhotoEditPage";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/fotos" element={<PhotoPage />} />
          <Route path="/fotos/:id" element={<PhotoDetail />} />
          <Route path="/login" element={<Login />} />

          <Route
            path="/admin"
            element={
              <PrivateRoute>
                <Admin />
              </PrivateRoute>
            }
          />
          <Route
            path="/fotos/agregarfoto"
            element={
              <PrivateRoute>
                <PhotoCreatePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/fotos/:id/editar"
            element={
              <PrivateRoute>
                <PhotoEditPage />
              </PrivateRoute>
            }
          />
          <Route path="/*" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
