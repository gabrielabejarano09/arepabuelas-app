import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import './DashboardLayout.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet /> {/* Aquí se renderizarán las páginas como Menú, Usuarios, etc. */}
      </main>
    </div>
  );
};

export default DashboardLayout;