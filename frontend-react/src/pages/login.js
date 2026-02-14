import React from "react";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../authconfig";

const Login = () => {
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginPopup(loginRequest);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Enterprise Time Tracker</h2>
      <button onClick={handleLogin}>Login with Entra ID</button>
    </div>
  );
};

export default Login;
