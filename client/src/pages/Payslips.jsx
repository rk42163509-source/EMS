import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Plus, Printer } from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { payslipService, employeeService } from "../services";
import { useAuth } from "../context/AuthContext";
import { MONTHS } from "../constants";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";
import { formatCurrency } from "../utils/helpers";

const Payslips = () => {
  const { isAdmin } = useAuth();
  const [payslips, setPayslips] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, formState: { isSubmitting } } = useForm();

  const fetchPayslips = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = isAdmin ? await payslipService.getAll({ page, limit: 10 }) : await payslipService.getMy({ page, limit: 10 });
      setPayslips(data.data.payslips);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load payslips");
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchPayslips();
    if (isAdmin) {
      employeeService.getAll({ limit: 100 }).then((res) => setEmployees(res.data.data.employees));
    }
  }, [fetchPayslips, isAdmin]);

  const onGenerate = async (formData) => {
    try {
      await payslipService.generate({
        employeeId: formData.employeeId,
        month: parseInt(formData.month, 10),
        year: parseInt(formData.year, 10),
      });
      toast.success("Payslip generated");
      setModalOpen(false);
      fetchPayslips();
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Payslips"
        subtitle={isAdmin ? "Generate and manage employee payslips" : "View and download your payslips"}
        action={isAdmin && <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Generate Payslip</button>}
      />

      <div className="card">
        {loading ? <TableSkeleton /> : payslips.length === 0 ? (
          <EmptyState title="No payslips found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead><tr>
                {isAdmin && <th>Employee</th>}
                <th>Period</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Salary</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {payslips.map((p) => {
                  const emp = p.employeeId;
                  return (
                    <tr key={p._id}>
                      {isAdmin && <td>{emp ? `${emp.firstName} ${emp.lastName}` : "—"}</td>}
                      <td>{MONTHS[p.month - 1]} {p.year}</td>
                      <td>{formatCurrency(p.basicSalary)}</td>
                      <td>{formatCurrency(p.allowances)}</td>
                      <td>{formatCurrency(p.deductions)}</td>
                      <td className="font-semibold">{formatCurrency(p.netSalary)}</td>
                      <td>
                        <Link to={`/print/payslip/${p._id}`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 inline-flex" title="View & Print">
                          <Printer className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={fetchPayslips} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Generate Payslip">
        <form onSubmit={handleSubmit(onGenerate)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Employee</label>
            <select {...register("employeeId", { required: true })}>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Month</label>
              <select {...register("month", { required: true })}>
                {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1 block">Year</label>
              <input type="number" defaultValue={new Date().getFullYear()} {...register("year", { required: true })} />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Generating..." : "Generate"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Payslips;
