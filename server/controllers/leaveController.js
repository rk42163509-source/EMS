import Leave from "../models/Leave.js";
import Employee from "../models/Employee.js";
import { successResponse, errorResponse, paginate, getDaysBetween } from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

const balanceField = { ANNUAL: "annualLeaveBalance", CASUAL: "casualLeaveBalance", SICK: "sickLeaveBalance" };

export const applyLeave = async (req, res) => {
  const { type, startDate, endDate, reason } = req.body;
  const days = getDaysBetween(startDate, endDate);
  const employee = req.employee;

  const field = balanceField[type];
  if (employee[field] < days) {
    return errorResponse(res, `Insufficient ${type.toLowerCase()} leave balance`, 400);
  }

  const leave = await Leave.create({
    employeeId: employee._id,
    type,
    startDate,
    endDate,
    reason,
  });

  await logActivity({
    userId: req.user._id,
    action: "APPLY_LEAVE",
    entity: "Leave",
    entityId: leave._id,
    message: `${employee.firstName} applied for ${type} leave`,
  });

  return successResponse(res, leave, "Leave application submitted", 201);
};

export const cancelLeave = async (req, res) => {
  const leave = await Leave.findOne({ _id: req.params.id, employeeId: req.employee._id });
  if (!leave) return errorResponse(res, "Leave not found", 404);
  if (leave.status !== "PENDING") return errorResponse(res, "Only pending leaves can be cancelled", 400);

  leave.status = "CANCELLED";
  await leave.save();

  return successResponse(res, leave, "Leave cancelled");
};

export const getMyLeaves = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const filter = { employeeId: req.employee._id };

  const [leaves, total] = await Promise.all([
    Leave.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Leave.countDocuments(filter),
  ]);

  return successResponse(res, {
    leaves,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getAllLeaves = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { status, type } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (type) filter.type = type;

  const [leaves, total] = await Promise.all([
    Leave.find(filter)
      .populate("employeeId", "firstName lastName email department position")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Leave.countDocuments(filter),
  ]);

  return successResponse(res, {
    leaves,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const updateLeaveStatus = async (req, res) => {
  const { status, adminNote } = req.body;
  const leave = await Leave.findById(req.params.id).populate("employeeId");
  if (!leave) return errorResponse(res, "Leave not found", 404);
  if (!["APPROVED", "REJECTED"].includes(status)) {
    return errorResponse(res, "Invalid status", 400);
  }
  if (leave.status !== "PENDING") return errorResponse(res, "Leave already processed", 400);

  if (status === "APPROVED") {
    const days = getDaysBetween(leave.startDate, leave.endDate);
    const employee = await Employee.findById(leave.employeeId);
    const field = balanceField[leave.type];
    if (employee[field] < days) {
      return errorResponse(res, "Employee has insufficient leave balance", 400);
    }
    employee[field] -= days;
    await employee.save();
  }

  leave.status = status;
  leave.adminNote = adminNote || "";
  await leave.save();

  await logActivity({
    userId: req.user._id,
    action: status,
    entity: "Leave",
    entityId: leave._id,
    message: `Leave ${status.toLowerCase()} for ${leave.employeeId?.firstName || "employee"}`,
  });

  return successResponse(res, leave, `Leave ${status.toLowerCase()}`);
};

export const getLeaveStats = async (req, res) => {
  const stats = await Leave.aggregate([
    { $group: { _id: { type: "$type", status: "$status" }, count: { $sum: 1 } } },
  ]);
  return successResponse(res, stats);
};
