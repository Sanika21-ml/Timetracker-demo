import { Outlet } from "react-router-dom";
import UserSidebar from "../pages/UserSidebar";
import "../styles/Layout.css";

const UserLayout = () => {
  return (
    <div className="layout">
      <UserSidebar />
      <div className="header">
        
      </div>
      {/* PAGE CONTENT */}
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default UserLayout;
