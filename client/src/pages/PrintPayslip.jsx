import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Printer } from "lucide-react";
import toast from "react-hot-toast";
import { payslipService } from "../services";
import Loading from "../components/Loading";
import { formatCurrency, formatDate } from "../utils/helpers";
import { MONTHS } from "../constants";

const PrintPayslip = () => {
  const { id } = useParams();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    payslipService.getById(id)
      .then((res) => setPayslip(res.data.data))
      .catch(() => toast.error("Failed to load payslip"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading />;
  if (!payslip) return <p className="text-center text-slate-500 py-12">Payslip not found</p>;

  const emp = payslip.employeeId;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-end mb-4 print:hidden">
          <button onClick={() => window.print()} className="btn-primary inline-flex items-center gap-2">
            <Printer className="w-4 h-4" /> Print / Download PDF
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-200">
          <div className="text-center border-b border-slate-200 pb-6 mb-6">
            <h1 className="text-2xl font-bold text-slate-900">Employee MS</h1>
            <p className="text-slate-500 mt-1">Payslip for {MONTHS[payslip.month - 1]} {payslip.year}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider">Employee</p>
              <p className="font-medium mt-1">{emp?.firstName} {emp?.lastName}</p>
              <p className="text-sm text-slate-500">{emp?.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wider">Department</p>
              <p className="font-medium mt-1">{emp?.department}</p>
              <p className="text-sm text-slate-500">{emp?.position}</p>
            </div>
          </div>

          <table className="w-full text-sm mb-8">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 text-slate-500 font-medium">Description</th>
                <th className="text-right py-3 text-slate-500 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-100"><td className="py-3">Basic Salary</td><td className="text-right py-3">{formatCurrency(payslip.basicSalary)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-3">Allowances</td><td className="text-right py-3 text-emerald-600">+{formatCurrency(payslip.allowances)}</td></tr>
              <tr className="border-b border-slate-100"><td className="py-3">Deductions</td><td className="text-right py-3 text-rose-600">-{formatCurrency(payslip.deductions)}</td></tr>
              <tr><td className="py-4 font-bold text-slate-900">Net Salary</td><td className="text-right py-4 font-bold text-lg text-indigo-600">{formatCurrency(payslip.netSalary)}</td></tr>
            </tbody>
          </table>

          <p className="text-xs text-slate-400 text-center">Generated on {formatDate(payslip.createdAt)}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintPayslip;
