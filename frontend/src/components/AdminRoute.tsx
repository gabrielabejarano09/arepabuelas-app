import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  role: 'ADMIN' | 'USER';
}

const AdminRoute = () => {
  const token = localStorage.getItem('token');

  // 1. Si no hay token, fuera.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    // 2. Si el rol NO es 'admin', fuera.
    if (decodedToken.role !== "ADMIN") {
      // Redirigir a una página de no autorizado o a su home
      return <Navigate to="/unauthorized" replace />;
    }
  } catch (e) {
    // Si el token es inválido, fuera.
    console.error("Token inválido:", e);
    return <Navigate to="/login" replace />;
  }
  
  // 3. Si todo está bien, permite el acceso a la ruta.
  return <Outlet />;
};

export default AdminRoute;