import { NavLink, useNavigate } from "react-router-dom";
import {
  Clock,
  Users,
  Briefcase,
  Layers,
  FileText,
  UserCircle,
  LogOut,
} from "lucide-react";
import logo from "../assets/images/cnovate-logo.png";
import "../styles/UserSidebar.css";

const UserSidebar = () => {
   const navigate = useNavigate();
  return (
    <aside className="app-sidebar">
      {/* LOGO */}
      <div className="sidebar-logo-section">
        <img src={logo} alt="Cnovate" className="sidebar-logo" />
      </div>

      {/* MENU */}
      <nav className="sidebar-menu">
        <NavLink
          to="/user/timesheet"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Clock size={18} />
          <span>Track Time</span>
        </NavLink>

        <NavLink
          to="/user/employees"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Users size={18} />
          <span>Employees</span>
        </NavLink>

        <NavLink
          to="/user/projects"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Briefcase size={18} />
          <span>Projects</span>
        </NavLink>

        <NavLink
          to="/user/workstreams"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <Layers size={18} />
          <span>Workstreams</span>
        </NavLink>

        <NavLink
          to="/user/reports"
          className={({ isActive }) =>
            `sidebar-item ${isActive ? "active" : ""}`
          }
        >
          <FileText size={18} />
          <span>Reports</span>
        </NavLink>
      </nav>

      {/* USER INFO */}
      <div className="sidebar-footer">
        <div className="footer-left">
          <UserCircle size={36} className="footer-avatar" />
          <div className="footer-user">
          <div className="footer-name">Maaz Patel</div>
          <div className="footer-role">Admin</div>
        </div>
      </div>

      <LogOut
        size={20}
        className="footer-logout"
        onClick={() => navigate("/")}
      />
      </div>
    </aside>
  );
};

export default UserSidebar;
