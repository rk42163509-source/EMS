import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import toast from "react-hot-toast";
import { departmentService, employeeService } from "../services";
import PageHeader from "../components/PageHeader";
import Modal from "../components/Modal";
import EmptyState from "../components/EmptyState";
import TableSkeleton from "../components/TableSkeleton";

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedDept, setSelectedDept] = useState(null);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, empRes] = await Promise.all([
        departmentService.getAll(),
        employeeService.getAll({ limit: 100 }),
      ]);
      setDepartments(deptRes.data.data);
      setEmployees(empRes.data.data.employees);
    } catch {
      toast.error("Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ name: "", description: "" });
    setModalOpen(true);
  };

  const openEdit = (dept) => {
    setEditing(dept);
    reset({ name: dept.name, description: dept.description });
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editing) {
        await departmentService.update(editing._id, data);
        toast.success("Department updated");
      } else {
        await departmentService.create(data);
        toast.success("Department created");
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this department?")) return;
    try {
      await departmentService.delete(id);
      toast.success("Department deleted");
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const onAssign = async (data) => {
    try {
      await departmentService.assignEmployee(selectedDept._id, data.employeeId);
      toast.success("Employee assigned");
      setAssignModal(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Assignment failed");
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Departments"
        subtitle="Manage organizational departments"
        action={<button onClick={openCreate} className="btn-primary inline-flex items-center gap-2"><Plus className="w-4 h-4" /> Add Department</button>}
      />

      {loading ? <TableSkeleton /> : departments.length === 0 ? (
        <EmptyState title="No departments" action={<button onClick={openCreate} className="btn-primary">Add Department</button>} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <div key={dept._id} className="card card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium text-slate-900">{dept.name}</h3>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{dept.description || "No description"}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Users className="w-4 h-4" />
                  <span>{dept.employeeCount || 0} employees</span>
                </div>
                <button
                  onClick={() => { setSelectedDept(dept); setAssignModal(true); }}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Assign Employee
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Department" : "Add Department"}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div><label className="text-sm font-medium text-slate-700 mb-1 block">Name</label><input {...register("name", { required: true })} /></div>
          <div><label className="text-sm font-medium text-slate-700 mb-1 block">Description</label><textarea rows={3} {...register("description")} /></div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">{isSubmitting ? "Saving..." : editing ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={assignModal} onClose={() => setAssignModal(false)} title={`Assign to ${selectedDept?.name}`}>
        <form onSubmit={handleSubmit(onAssign)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1 block">Employee</label>
            <select {...register("employeeId", { required: true })}>
              <option value="">Select employee</option>
              {employees.map((e) => <option key={e._id} value={e._id}>{e.firstName} {e.lastName}</option>)}
            </select>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setAssignModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Assign</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
