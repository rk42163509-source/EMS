import { Toaster } from "react-hot-toast";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginLanding from "./pages/LoginLanding";
import Layout from "./pages/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Attendance from "./pages/Attendance";
import Leave from "./pages/Leave";
import Payslips from "./pages/Payslips";
import Settings from "./pages/Settings";
import PrintPayslip from "./pages/PrintPayslip";
import LoginForm from "./components/LoginForm";

const App = () => {
  return (
    <>
      <Toaster />

      <Routes>
        {/* Redirect / -> /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Login Landing */}
        <Route path="/login" element={<LoginLanding />} />

        {/* Login Forms */}
        <Route
          path="/login/admin"
          element={
            <LoginForm
              role="admin"
              title="Admin Portal"
              subtitle="Sign in to manage the organization"
            />
          }
        />

        <Route
          path="/login/employee"
          element={
            <LoginForm
              role="employee"
              title="Employee Portal"
              subtitle="Sign in to access your account"
            />
          }
        />

        {/* Protected Pages */}
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/leave" element={<Leave />} />
          <Route path="/payslips" element={<Payslips />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/print/payslip/:id" element={<PrintPayslip />} />

        {/* Invalid URL -> /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};

export default App;