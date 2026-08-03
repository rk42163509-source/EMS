import { useEffect, useState } from "react";
import { dashboardService } from "../services";
import Loading from "../components/Loading";
import EmployeeDashboard from "../components/EmployeeDashboard";
import AdminDashboard from "../components/AdminDashboard";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = isAdmin
          ? await dashboardService.getAdmin()
          : await dashboardService.getEmployee();
        setData(res.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [isAdmin]);

  if (loading) return <Loading />;
  if (!data) return <p className="text-center text-slate-500 py-12">Failed to load dashboard</p>;

  return isAdmin ? <AdminDashboard data={data} /> : <EmployeeDashboard data={data} />;
};

export default Dashboard;
