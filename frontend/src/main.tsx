import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Páginas Públicas
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Componentes de Rutas
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Layouts
import DashboardLayout from "./components/DashboardLayout";

// Páginas de Admin
import MenuPage from "./pages/admin/MenuPage";
import AddProductPage from "./pages/admin/AddProductPage";
import MenuUser from "./pages/MenuUser";

//import UserHomePage from './pages/user/UserHomePage';
//import UserMenuPage from './pages/user/UserMenuPage';
//import UnauthorizedPage from './pages/UnauthorizedPage'; // <-- Página para acceso denegado

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <Routes>
        {/* --- Rutas Públicas --- */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/*<Route path="/unauthorized" element={<UnauthorizedPage />} /> */}

        {/* --- Rutas de Administrador --- */}
        {/* 2. Usa AdminRoute para proteger estas rutas */}
        <Route element={<AdminRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/nuevo" element={<AddProductPage />} />
            {/* ... más rutas de admin aquí ... */}
          </Route>
        </Route>

        {/* --- Rutas de Usuario Normal --- */}
        {/* 3. Usa ProtectedRoute para las rutas de usuario */}
        <Route element={<ProtectedRoute />}>
          <Route path="/home" element={<MenuUser />} />
          {/*<Route path="/user/menu" element={<UserMenuPage />} />*/}
          {/* ... más rutas de usuario aquí ... */}
        </Route>

        {/* Ruta por defecto */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
