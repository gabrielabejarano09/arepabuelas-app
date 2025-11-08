import { NavLink } from "react-router-dom";
import "./Sidebar.css";
import logo from "../assets/logo-blanco.png"; // Reutilizamos el logo
import { FiHome, FiClock, FiLogOut } from "react-icons/fi"; // Iconos de ejemplo
import { AiFillMoneyCollect } from "react-icons/ai";

const SidebarClient = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/home" className="nav-link">
          <FiHome className="nav-icon" />
          <span>Menú</span>
        </NavLink>
        <NavLink to="/purchased" className="nav-link">
          <FiClock className="nav-icon" />
          <span>Historial</span>
        </NavLink>
        <NavLink to="/payment" className="nav-link">
          <AiFillMoneyCollect className="nav-icon" />
          <span>Pagar</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <NavLink
          to="/login"
          onClick={() => localStorage.removeItem("token")}
          className="nav-link logout"
        >
          <FiLogOut className="nav-icon" />
        </NavLink>
      </div>
    </aside>
  );
};

export default SidebarClient;
