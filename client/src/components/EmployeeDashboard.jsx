import { Calendar, DollarSign, FileText, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/helpers";
import StatCard from "./StatCard";

const EmployeeDashboard = ({ data }) => {
  const emp = data.employee;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Welcome, {emp?.firstName}!</h1>
        <p className="page-subtitle">{emp?.position} — {emp?.department || "No Department"}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <StatCard icon={Calendar} title="Days Present" value={data.currentMonthAttendance} subtitle="This month" color="indigo" />
        <StatCard icon={FileText} title="Pending Leaves" value={data.pendingLeaves} subtitle="Awaiting approval" color="amber" />
        <StatCard
          icon={DollarSign}
          title="Latest Payslip"
          value={data.latestPayslip ? formatCurrency(data.latestPayslip.netSalary) : "N/A"}
          subtitle="Most recent payout"
          color="emerald"
        />
        <StatCard
          icon={Calendar}
          title="Leave Balance"
          value={`${(data.leaveBalance?.annual || 0) + (data.leaveBalance?.casual || 0) + (data.leaveBalance?.sick || 0)}`}
          subtitle="Total days remaining"
          color="blue"
        />
      </div>

      {data.leaveBalance && (
        <div className="card p-5 mb-8">
          <h3 className="text-sm font-medium text-slate-700 mb-4">Leave Balance</h3>
          <div className="grid grid-cols-3 gap-4">
            {["annual", "casual", "sick"].map((type) => (
              <div key={type} className="text-center p-3 rounded-lg bg-slate-50">
                <p className="text-2xl font-bold text-slate-900">{data.leaveBalance[type]}</p>
                <p className="text-xs text-slate-500 capitalize mt-1">{type}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Link to="/attendance" className="btn-primary text-center inline-flex items-center justify-center gap-2">
          Mark Attendance <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/leave" className="btn-secondary text-center">Apply for Leave</Link>
        {data.latestPayslip && (
          <Link to="/payslips" className="btn-secondary text-center">Download Payslip</Link>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
