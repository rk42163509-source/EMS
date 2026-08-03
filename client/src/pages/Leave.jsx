import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { Plus, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { leaveService } from "../services";
import { useAuth } from "../context/AuthContext";
import { LEAVE_TYPES } from "../constants";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import TableSkeleton from "../components/TableSkeleton";
import { formatDate } from "../utils/helpers";

const Leave = () => {
  const { isAdmin } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchLeaves = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 10, status: statusFilter || undefined };
      const { data } = isAdmin ? await leaveService.getAll(params) : await leaveService.getMy(params);
      setLeaves(isAdmin ? data.data.leaves : data.data.leaves);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load leaves");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, statusFilter]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const onApply = async (formData) => {
    try {
      await leaveService.apply(formData);
      toast.success("Leave application submitted");
      setModalOpen(false);
      reset();
      fetchLeaves();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to apply leave");
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await leaveService.updateStatus(id, { status });
      toast.success(`Leave ${status.toLowerCase()}`);
      fetchLeaves(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleCancel = async (id) => {
    try {
      await leaveService.cancel(id);
      toast.success("Leave cancelled");
      fetchLeaves(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Cancel failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Management"
        subtitle={isAdmin ? "Review and manage leave requests" : "Apply and track your leave requests"}
        action={!isAdmin && <button onClick={() => setModalOpen(true)} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Apply Leave</button>}
      />

      <div className="card mb-6 p-4">
        <select className="sm:w-48" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="card">
        {loading ? <TableSkeleton /> : leaves.length === 0 ? (
          <EmptyState title="No leave requests" description={!isAdmin ? "Apply for your first leave" : undefined} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead><tr>
                {isAdmin && <th>Employee</th>}
                <th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {leaves.map((leave) => {
                  const emp = leave.employeeId;
                  return (
                    <tr key={leave._id}>
                      {isAdmin && <td>{emp ? `${emp.firstName} ${emp.lastName}` : "—"}</td>}
                      <td><span className="badge bg-indigo-50 text-indigo-700">{leave.type}</span></td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td className="max-w-xs truncate">{leave.reason}</td>
                      <td><Badge status={leave.status} /></td>
                      <td>
                        {isAdmin && leave.status === "PENDING" && (
                          <div className="flex gap-2">
                            <button onClick={() => handleStatus(leave._id, "APPROVED")} className="p-1.5 rounded-md hover:bg-emerald-50 text-emerald-600"><Check className="w-4 h-4" /></button>
                            <button onClick={() => handleStatus(leave._id, "REJECTED")} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-600"><X className="w-4 h-4" /></button>
                          </div>
                        )}
                        {!isAdmin && leave.status === "PENDING" && (
                          <button onClick={() => handleCancel(leave._id)} className="text-xs text-rose-500 hover:text-rose-700">Cancel</button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={fetchLeaves} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Apply for Leave">
        <form onSubmit={handleSubmit(onApply)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Leave Type</label>
            <select {...register("type", { required: true })}>
              {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Start Date</label><input type="date" {...register("startDate", { required: true })} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">End Date</label><input type="date" {...register("endDate", { required: true })} /></div>
          </div>
          <div><label className="text-sm font-medium text-slate-700 mb-1 block">Reason</label><textarea rows={3} {...register("reason", { required: true })} /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Submitting..." : "Submit"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Leave;
