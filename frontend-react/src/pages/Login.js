import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";
import logo from "../assets/images/cnovate-logo.png";
import logom from "../assets/images/microsoft-icon.png";

const Login = () => {
  const navigate = useNavigate();

  const handleMicrosoftLogin = () => {
    // TEMP redirect — replace with Microsoft SSO later
    navigate("/user/timesheet");
  };

  return (
    <div className="login-container">
      <div className="login-box">

        {/* CNOVATE LOGO */}
        <div className="logo-container">
          <img src={logo} alt="Cnovate Logo" className="logo" />
        </div>

        {/* TITLE */}
        <h1 className="login-title">Cnovate Time Tracker</h1>
        <p className="login-subtitle">
          Streamline your time management
        </p>

        {/* MICROSOFT LOGIN BUTTON */}
        <button
          className="microsoft-btn"
          onClick={handleMicrosoftLogin}
        >
          <div className="ms-content">
            <img src={logom} alt="Microsoft" className="logom" />
            <span className="ms-text">Sign in with Microsoft</span>
          </div>
        </button>

      </div>
    </div>
  );
};

export default Login;
