import Payslip from "../models/Payslip.js";
import Employee from "../models/Employee.js";
import { successResponse, errorResponse, paginate } from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

export const generatePayslip = async (req, res) => {
  const { employeeId, month, year } = req.body;

  const employee = await Employee.findOne({ _id: employeeId, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee not found", 404);

  const existing = await Payslip.findOne({ employeeId, month, year });
  if (existing) return errorResponse(res, "Payslip already exists for this period", 400);

  const netSalary = employee.basicSalary + employee.allowances - employee.deductions;

  const payslip = await Payslip.create({
    employeeId,
    month,
    year,
    basicSalary: employee.basicSalary,
    allowances: employee.allowances,
    deductions: employee.deductions,
    netSalary,
  });

  await payslip.populate("employeeId", "firstName lastName email department position");

  await logActivity({
    userId: req.user._id,
    action: "GENERATE_PAYSLIP",
    entity: "Payslip",
    entityId: payslip._id,
    message: `Generated payslip for ${employee.firstName} ${employee.lastName} - ${month}/${year}`,
  });

  return successResponse(res, payslip, "Payslip generated", 201);
};

export const getAllPayslips = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { month, year, employeeId } = req.query;

  const filter = {};
  if (month) filter.month = parseInt(month, 10);
  if (year) filter.year = parseInt(year, 10);
  if (employeeId) filter.employeeId = employeeId;

  const [payslips, total] = await Promise.all([
    Payslip.find(filter)
      .populate("employeeId", "firstName lastName email department position")
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit),
    Payslip.countDocuments(filter),
  ]);

  return successResponse(res, {
    payslips,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getMyPayslips = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);

  const [payslips, total] = await Promise.all([
    Payslip.find({ employeeId: req.employee._id })
      .sort({ year: -1, month: -1 })
      .skip(skip)
      .limit(limit),
    Payslip.countDocuments({ employeeId: req.employee._id }),
  ]);

  return successResponse(res, {
    payslips,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getPayslip = async (req, res) => {
  const payslip = await Payslip.findById(req.params.id).populate(
    "employeeId",
    "firstName lastName email department position phone"
  );
  if (!payslip) return errorResponse(res, "Payslip not found", 404);

  if (req.user.role === "EMPLOYEE" && payslip.employeeId._id.toString() !== req.employee._id.toString()) {
    return errorResponse(res, "Not authorized", 403);
  }

  return successResponse(res, payslip);
};
