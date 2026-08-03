import { Users, UserCheck, UserX, FileText, Building2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import StatCard from "./StatCard";
import { formatDate } from "../utils/helpers";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6"];

const AdminDashboard = ({ data }) => {
  const attendanceData = (data.charts?.attendanceChart || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    count: item.count,
  }));

  const leaveData = (data.charts?.leaveStats || []).map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const payrollData = (data.charts?.payrollChart || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    total: item.total,
  }));

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of your organization</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Users} title="Total Employees" value={data.totalEmployees} color="indigo" />
        <StatCard icon={UserCheck} title="Present Today" value={data.presentToday} color="emerald" />
        <StatCard icon={UserX} title="Absent Today" value={data.absentToday} color="rose" />
        <StatCard icon={FileText} title="Pending Leaves" value={data.pendingLeaves} color="amber" />
        <StatCard icon={Building2} title="Departments" value={data.totalDepartments} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Attendance Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Leave Statistics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={leaveData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {leaveData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Monthly Payroll</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v) => [`$${v.toLocaleString()}`, "Total"]} />
              <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Recent Activities</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {(data.recentActivities || []).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">No recent activities</p>
            ) : (
              data.recentActivities.map((activity) => (
                <div key={activity._id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm text-slate-700">{activity.message}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{formatDate(activity.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/employees" className="btn-primary inline-flex items-center gap-2">
          Manage Employees <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/leave" className="btn-secondary">Review Leaves</Link>
        <Link to="/payslips" className="btn-secondary">Generate Payslips</Link>
        <Link to="/departments" className="btn-secondary">Departments</Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
