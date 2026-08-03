import Department from "../models/Department.js";
import Employee from "../models/Employee.js";
import { successResponse, errorResponse, paginate } from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

export const getDepartments = async (req, res) => {
  const departments = await Department.find().populate("head", "firstName lastName email").sort({ name: 1 });

  const withStats = await Promise.all(
    departments.map(async (dept) => {
      const employeeCount = await Employee.countDocuments({
        department: dept.name,
        isDeleted: false,
        employmentStatus: "ACTIVE",
      });
      return { ...dept.toObject(), employeeCount };
    })
  );

  return successResponse(res, withStats);
};

export const getDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id).populate("head", "firstName lastName email");
  if (!department) return errorResponse(res, "Department not found", 404);

  const employees = await Employee.find({
    department: department.name,
    isDeleted: false,
  }).select("firstName lastName email position employmentStatus");

  return successResponse(res, { department, employees });
};

export const createDepartment = async (req, res) => {
  const { name, description, head } = req.body;
  const department = await Department.create({ name, description, head: head || null });

  await logActivity({
    userId: req.user._id,
    action: "CREATE",
    entity: "Department",
    entityId: department._id,
    message: `Created department ${name}`,
  });

  return successResponse(res, department, "Department created", 201);
};

export const updateDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return errorResponse(res, "Department not found", 404);

  const oldName = department.name;
  if (req.body.name) department.name = req.body.name;
  if (req.body.description !== undefined) department.description = req.body.description;
  if (req.body.head !== undefined) department.head = req.body.head || null;
  await department.save();

  if (req.body.name && req.body.name !== oldName) {
    await Employee.updateMany({ department: oldName }, { department: req.body.name });
  }

  return successResponse(res, department, "Department updated");
};

export const deleteDepartment = async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) return errorResponse(res, "Department not found", 404);

  const count = await Employee.countDocuments({ department: department.name, isDeleted: false });
  if (count > 0) return errorResponse(res, "Cannot delete department with active employees", 400);

  await department.deleteOne();
  return successResponse(res, null, "Department deleted");
};

export const assignEmployee = async (req, res) => {
  const { employeeId } = req.body;
  const department = await Department.findById(req.params.id);
  if (!department) return errorResponse(res, "Department not found", 404);

  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);

  employee.department = department.name;
  employee.departmentId = department._id;
  await employee.save();

  return successResponse(res, employee, "Employee assigned to department");
};
