import React from "react";
import { useMsal } from "@azure/msal-react";

const Navbar = () => {
  const { instance, accounts } = useMsal();

  const logout = () => {
    instance.logoutPopup();
  };

  return (
    <nav style={{ padding: "10px", background: "#0078D4", color: "white" }}>
      <span>Time Tracker App</span>
      {accounts.length > 0 && (
        <>
          <span style={{ marginLeft: "20px" }}>
            {accounts[0].username}
          </span>
          <button style={{ marginLeft: "20px" }} onClick={logout}>
            Logout
          </button>
        </>
      )}
    </nav>
  );
};

export default Navbar;
