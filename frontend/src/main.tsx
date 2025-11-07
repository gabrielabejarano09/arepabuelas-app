import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage'; // <-- Asegúrate de importar
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import MenuPage from './pages/MenuPage';
import AddProductPage from './pages/AddProductPage';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* // Ruta por defecto al login */}
        <Route path="*" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/menu/nuevo" element={<AddProductPage />} />
            {/* Aquí puedes añadir más rutas protegidas que usarán el mismo layout */}
            {/* <Route path="/usuarios" element={<UsersPage />} /> */}
            {/* <Route path="/historial" element={<HistoryPage />} /> */}
          </Route>
        </Route>
      </Routes>
    </Router>
  </StrictMode>
);


