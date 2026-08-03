import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Plus, Search, Pencil, Trash2, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { employeeService } from "../services";
import { DEPARTMENTS } from "../constants";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Badge from "../components/Badge";
import TableSkeleton from "../components/TableSkeleton";
import { formatCurrency, formatDate, getInitials } from "../utils/helpers";

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchEmployees = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await employeeService.getAll({ page, limit: 10, search, department });
      setEmployees(data.data.employees);
      setPagination(data.data.pagination);
    } catch {
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  }, [search, department]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  const openCreate = () => {
    setEditing(null);
    setImageFile(null);
    reset({ firstName: "", lastName: "", email: "", password: "password123", phone: "", department: "", position: "", basicSalary: 0, allowances: 0, deductions: 0 });
    setModalOpen(true);
  };

  const openEdit = (emp) => {
    setEditing(emp);
    setImageFile(null);
    reset({
      firstName: emp.firstName, lastName: emp.lastName, email: emp.email,
      phone: emp.phone, department: emp.department, position: emp.position,
      basicSalary: emp.basicSalary, allowances: emp.allowances, deductions: emp.deductions,
    });
    setModalOpen(true);
  };

  const onSubmit = async (formData) => {
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => { if (v !== undefined && v !== "") fd.append(k, v); });
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await employeeService.update(editing._id, fd);
        toast.success("Employee updated");
      } else {
        await employeeService.create(fd);
        toast.success("Employee created");
      }
      setModalOpen(false);
      fetchEmployees(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      await employeeService.delete(id);
      toast.success("Employee deleted");
      fetchEmployees(pagination.page);
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Employees"
        subtitle="Manage your organization's workforce"
        action={<button onClick={openCreate} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Employee</button>}
      />

      <div className="card mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input className="pl-10" placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <select className="sm:w-48" value={department} onChange={(e) => setDepartment(e.target.value)}>
            <option value="">All Departments</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {loading ? <TableSkeleton /> : employees.length === 0 ? (
          <EmptyState title="No employees found" description="Add your first employee to get started" action={<button onClick={openCreate} className="btn-primary">Add Employee</button>} />
        ) : (
          <div className="overflow-x-auto">
            <table className="table-modern">
              <thead><tr>
                <th>Employee</th><th>Department</th><th>Position</th><th>Salary</th><th>Status</th><th>Joined</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-semibold">
                          {getInitials(emp.firstName, emp.lastName)}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{emp.firstName} {emp.lastName}</p>
                          <p className="text-xs text-slate-500">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{emp.department || "—"}</td>
                    <td>{emp.position || "—"}</td>
                    <td>{formatCurrency(emp.basicSalary)}</td>
                    <td><Badge status={emp.employmentStatus} /></td>
                    <td>{formatDate(emp.joinDate)}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Link to={`/employees/${emp._id}`} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><Eye className="w-4 h-4" /></Link>
                        <button onClick={() => openEdit(emp)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(emp._id)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} onPageChange={fetchEmployees} />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Employee" : "Add Employee"} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">First Name</label><input {...register("firstName", { required: true })} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Last Name</label><input {...register("lastName", { required: true })} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Email</label><input type="email" {...register("email", { required: true })} disabled={!!editing} /></div>
            {!editing && <div><label className="text-sm font-medium text-slate-700 mb-1 block">Password</label><input type="password" {...register("password")} /></div>}
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Phone</label><input {...register("phone")} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Department</label>
              <select {...register("department")}><option value="">Select</option>{DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}</select>
            </div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Position</label><input {...register("position")} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Basic Salary</label><input type="number" {...register("basicSalary")} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Allowances</label><input type="number" {...register("allowances")} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Deductions</label><input type="number" {...register("deductions")} /></div>
            <div><label className="text-sm font-medium text-slate-700 mb-1 block">Profile Picture</label><input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Saving..." : editing ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Employees;
