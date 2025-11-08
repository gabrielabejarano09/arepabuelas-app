import { Outlet } from "react-router-dom";
import "./DashboardLayout.css";
import SidebarClient from "./SidebarClient_temp";

const DashboardLayoutClient = () => {
  return (
    <div className="dashboard-layout">
      <SidebarClient />
      <main className="main-content">
        <Outlet />{" "}
        {/* Aquí se renderizarán las páginas como Menú, Usuarios, etc. */}
      </main>
    </div>
  );
};

export default DashboardLayoutClient;
