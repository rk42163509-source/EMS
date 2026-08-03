import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await authService.getMe();
      setUser(data.data.user);
      setEmployee(data.data.employee);
      localStorage.setItem("user", JSON.stringify(data.data.user));
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setEmployee(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password, expectedRole) => {
    const { data } = await authService.login({ email, password });
    const { token, user: userData, employee: emp } = data.data;

    if (expectedRole && userData.role !== expectedRole.toUpperCase()) {
      throw new Error(`Please use the ${userData.role === "ADMIN" ? "Admin" : "Employee"} portal`);
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setEmployee(emp);
    toast.success("Login successful!");
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setEmployee(null);
    toast.success("Logged out successfully");
  };

  const updateEmployee = (emp) => setEmployee(emp);

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        loading,
        login,
        logout,
        fetchUser,
        updateEmployee,
        isAdmin: user?.role === "ADMIN",
        isEmployee: user?.role === "EMPLOYEE",
        darkMode,
        setDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
