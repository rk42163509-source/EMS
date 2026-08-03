import bcrypt from "bcryptjs";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import { successResponse, errorResponse, paginate } from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

export const getEmployees = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { search, department, status } = req.query;

  const filter = { isDeleted: false };
  if (department) filter.department = department;
  if (status) filter.employmentStatus = status;
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { position: { $regex: search, $options: "i" } },
    ];
  }

  const [employees, total] = await Promise.all([
    Employee.find(filter).populate("userId", "email role").sort({ createdAt: -1 }).skip(skip).limit(limit),
    Employee.countDocuments(filter),
  ]);

  return successResponse(res, {
    employees,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getEmployee = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false }).populate(
    "userId",
    "email role"
  );
  if (!employee) return errorResponse(res, "Employee not found", 404);
  return successResponse(res, employee);
};

export const createEmployee = async (req, res) => {
  const {
    firstName, lastName, email, password, phone, department, position,
    basicSalary, allowances, deductions, joinDate, bio,
  } = req.body;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) return errorResponse(res, "Email already registered", 400);

  const hashedPassword = await bcrypt.hash(password || "password123", 12);
  const user = await User.create({ email: email.toLowerCase(), password: hashedPassword, role: "EMPLOYEE" });

  const image = req.file ? `/uploads/${req.file.filename}` : null;

  const employee = await Employee.create({
    userId: user._id,
    firstName,
    lastName,
    email: email.toLowerCase(),
    phone: phone || "",
    department: department || "",
    position: position || "",
    basicSalary: basicSalary || 0,
    allowances: allowances || 0,
    deductions: deductions || 0,
    joinDate: joinDate || new Date(),
    bio: bio || "",
    image,
  });

  await logActivity({
    userId: req.user._id,
    action: "CREATE",
    entity: "Employee",
    entityId: employee._id,
    message: `Created employee ${employee.firstName} ${employee.lastName}`,
  });

  return successResponse(res, employee, "Employee created", 201);
};

export const updateEmployee = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);

  const fields = [
    "firstName", "lastName", "phone", "department", "position",
    "basicSalary", "allowances", "deductions", "employmentStatus", "bio", "joinDate",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) employee[f] = req.body[f];
  });

  if (req.file) employee.image = `/uploads/${req.file.filename}`;

  await employee.save();

  await logActivity({
    userId: req.user._id,
    action: "UPDATE",
    entity: "Employee",
    entityId: employee._id,
    message: `Updated employee ${employee.firstName} ${employee.lastName}`,
  });

  return successResponse(res, employee, "Employee updated");
};

export const deleteEmployee = async (req, res) => {
  const employee = await Employee.findOne({ _id: req.params.id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);

  employee.isDeleted = true;
  employee.employmentStatus = "INACTIVE";
  await employee.save();

  await logActivity({
    userId: req.user._id,
    action: "DELETE",
    entity: "Employee",
    entityId: employee._id,
    message: `Deleted employee ${employee.firstName} ${employee.lastName}`,
  });

  return successResponse(res, null, "Employee deleted");
};
