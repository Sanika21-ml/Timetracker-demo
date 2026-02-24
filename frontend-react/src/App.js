import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import UserLayout from "./layouts/UserLayout";

import Login from "./pages/Login";
import Timesheet from "./pages/Timesheet";
import Employees from "./pages/Employees";
import Projects from "./pages/Projects";
import Workstreams from "./pages/Workstreams";
import Reports from "./pages/Reports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* LOGIN */}
        <Route path="/" element={<Login />} />

        {/* USER LAYOUT (SIDEBAR FIXED HERE) */}
        <Route path="/user" element={<UserLayout />}>
          <Route index element={<Navigate to="timesheet" />} />
          <Route path="timesheet" element={<Timesheet />} />
          <Route path="employees" element={<Employees/>}/>
          <Route path="projects" element={<Projects />} />
          <Route path="workstreams" element={<Workstreams />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
