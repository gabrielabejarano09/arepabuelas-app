import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";

// Páginas Públicas
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MenuUser from "./pages/users/MenuUser";
import HistorialUser from "./pages/users/HistorialUser";
import PaymentUser from "./pages/users/PaymentUser";

// Componentes de Rutas
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Layouts
import DashboardLayout from "./components/DashboardLayout";
import DashboardLayoutClient from "./components/DashboardLayoutClient";

// Páginas de Admin
import MenuPage from "./pages/admin/MenuPage";
import AddProductPage from "./pages/admin/AddProductPage";
import EditProductPage from "./pages/admin/EditProductPage";
import UsersPage from "./pages/admin/UsersPage";
import HistoryPage from "./pages/admin/HistoryPage";

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
            <Route path="/menu/edit/:id" element={<EditProductPage />} />
            <Route path="/usuarios" element={<UsersPage />} />
            <Route path="/historial" element={<HistoryPage />} />
            {/* ... más rutas de admin aquí ... */}
          </Route>
        </Route>

        {/* --- Rutas de Usuario Normal --- */}
        {/* 3. Usa ProtectedRoute para las rutas de usuario */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayoutClient />}>
            <Route path="/home" element={<MenuUser />} />
            <Route path="/purchased" element={<HistorialUser />} />
            <Route path="/payment" element={<PaymentUser />} />
            <Route path="/payment/:orderId" element={<PaymentUser />} />
            {/* ... más rutas de usuario aquí ... */}
          </Route>
          |{" "}
        </Route>
        {/* Ruta por defecto */}
        <Route path="*" element={<LoginPage />} />
      </Routes>
    </Router>
  </StrictMode>
);
