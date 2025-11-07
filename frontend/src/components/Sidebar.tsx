import { NavLink } from 'react-router-dom';
import './Sidebar.css';
import logo from '../assets/logo-blanco.png'; // Reutilizamos el logo
import { FiHome, FiUsers, FiClock, FiSettings, FiLogOut } from 'react-icons/fi'; // Iconos de ejemplo

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="Logo" className="sidebar-logo" />
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/menu" className="nav-link">
          <FiHome className="nav-icon" />
          <span>Menú</span>
        </NavLink>
        <NavLink to="/usuarios" className="nav-link">
          <FiUsers className="nav-icon" />
          <span>Usuarios</span>
        </NavLink>
        <NavLink to="/historial" className="nav-link">
          <FiClock className="nav-icon" />
          <span>Historial</span>
        </NavLink>
        <NavLink to="/ajustes" className="nav-link">
          <FiSettings className="nav-icon" />
          <span>Ajustes</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <NavLink to="/login" onClick={() => localStorage.removeItem('token')} className="nav-link logout">
          <FiLogOut className="nav-icon" />
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;