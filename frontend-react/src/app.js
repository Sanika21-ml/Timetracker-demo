import React from "react";
import { useIsAuthenticated } from "@azure/msal-react";
import Login from "./pages/login";
import Dashboard from "./components/dashboard";
import Navbar from "./components/navbar";

function App() {
  const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <Navbar />
      {isAuthenticated ? <Dashboard /> : <Login />}
    </>
  );
}

export default App;
