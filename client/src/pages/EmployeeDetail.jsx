import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { employeeService } from "../services";
import Loading from "../components/Loading";
import Badge from "../components/Badge";
import { formatCurrency, formatDate, getInitials } from "../utils/helpers";
import { IMAGE_BASE } from "../constants";

const EmployeeDetail = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getById(id)
      .then((res) => setEmployee(res.data.data))
      .catch(() => toast.error("Failed to load employee"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!employee) return <p className="text-center text-slate-500 py-12">Employee not found</p>;

  return (
    <div className="animate-fade-in">
      <Link to="/employees" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Employees
      </Link>

      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
            {employee.image ? (
              <img src={`${IMAGE_BASE}${employee.image}`} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : getInitials(employee.firstName, employee.lastName)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-medium text-slate-900">{employee.firstName} {employee.lastName}</h1>
              <Badge status={employee.employmentStatus} />
            </div>
            <p className="text-slate-500">{employee.position} — {employee.department}</p>
            <p className="text-sm text-slate-400 mt-1">{employee.email} · {employee.phone || "No phone"}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
          {[
            { label: "Basic Salary", value: formatCurrency(employee.basicSalary) },
            { label: "Allowances", value: formatCurrency(employee.allowances) },
            { label: "Deductions", value: formatCurrency(employee.deductions) },
            { label: "Net Salary", value: formatCurrency(employee.basicSalary + employee.allowances - employee.deductions) },
          ].map((item) => (
            <div key={item.label} className="p-4 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <div className="p-4 rounded-lg bg-slate-50"><p className="text-xs text-slate-500">Join Date</p><p className="font-medium mt-1">{formatDate(employee.joinDate)}</p></div>
          <div className="p-4 rounded-lg bg-slate-50"><p className="text-xs text-slate-500">Annual Leave</p><p className="font-medium mt-1">{employee.annualLeaveBalance} days</p></div>
          <div className="p-4 rounded-lg bg-slate-50"><p className="text-xs text-slate-500">Bio</p><p className="font-medium mt-1">{employee.bio || "—"}</p></div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetail;
