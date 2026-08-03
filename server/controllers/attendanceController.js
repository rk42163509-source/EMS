import Attendance from "../models/Attendance.js";
import Employee from "../models/Employee.js";
import {
  successResponse, errorResponse, paginate, getDayType, startOfDay, endOfDay,
} from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

export const checkIn = async (req, res) => {
  const employee = req.employee;
  const today = startOfDay();

  let record = await Attendance.findOne({ employeeId: employee._id, date: today });
  if (record?.checkIn) return errorResponse(res, "Already checked in today", 400);

  if (!record) {
    record = await Attendance.create({
      employeeId: employee._id,
      date: today,
      checkIn: new Date(),
      status: "PRESENT",
    });
  } else {
    record.checkIn = new Date();
    record.status = "PRESENT";
    await record.save();
  }

  await logActivity({
    userId: req.user._id,
    action: "CHECK_IN",
    entity: "Attendance",
    entityId: record._id,
    message: `${employee.firstName} checked in`,
  });

  return successResponse(res, record, "Checked in successfully");
};

export const checkOut = async (req, res) => {
  const employee = req.employee;
  const today = startOfDay();

  const record = await Attendance.findOne({ employeeId: employee._id, date: today });
  if (!record?.checkIn) return errorResponse(res, "You haven't checked in today", 400);
  if (record.checkOut) return errorResponse(res, "Already checked out today", 400);

  record.checkOut = new Date();
  const diffMs = record.checkOut - record.checkIn;
  record.workingHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  record.dayType = getDayType(record.workingHours);
  await record.save();

  await logActivity({
    userId: req.user._id,
    action: "CHECK_OUT",
    entity: "Attendance",
    entityId: record._id,
    message: `${employee.firstName} checked out`,
  });

  return successResponse(res, record, "Checked out successfully");
};

export const getTodayAttendance = async (req, res) => {
  const today = startOfDay();
  const record = await Attendance.findOne({ employeeId: req.employee._id, date: today });
  return successResponse(res, record);
};

export const getMyAttendance = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { month, year } = req.query;

  const filter = { employeeId: req.employee._id };
  if (month && year) {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    filter.date = {
      $gte: new Date(y, m, 1),
      $lte: new Date(y, m + 1, 0, 23, 59, 59),
    };
  }

  const [records, total] = await Promise.all([
    Attendance.find(filter).sort({ date: -1 }).skip(skip).limit(limit),
    Attendance.countDocuments(filter),
  ]);

  return successResponse(res, {
    records,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const getAllAttendance = async (req, res) => {
  const { page, limit, skip } = paginate(req.query.page, req.query.limit);
  const { search, date, employeeId } = req.query;

  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (date) {
    const d = startOfDay(new Date(date));
    filter.date = { $gte: d, $lte: endOfDay(d) };
  }

  let records = await Attendance.find(filter)
    .populate("employeeId", "firstName lastName email department position")
    .sort({ date: -1 })
    .skip(skip)
    .limit(limit);

  if (search) {
    records = records.filter((r) => {
      const emp = r.employeeId;
      if (!emp) return false;
      const term = search.toLowerCase();
      return (
        emp.firstName?.toLowerCase().includes(term) ||
        emp.lastName?.toLowerCase().includes(term) ||
        emp.email?.toLowerCase().includes(term)
      );
    });
  }

  const total = await Attendance.countDocuments(filter);

  return successResponse(res, {
    records,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
};

export const exportAttendance = async (req, res) => {
  const { date, employeeId } = req.query;
  const filter = {};
  if (employeeId) filter.employeeId = employeeId;
  if (date) {
    const d = startOfDay(new Date(date));
    filter.date = { $gte: d, $lte: endOfDay(d) };
  }

  const records = await Attendance.find(filter)
    .populate("employeeId", "firstName lastName email department")
    .sort({ date: -1 });

  const csv = [
    "Date,Employee,Email,Department,Check In,Check Out,Hours,Status,Day Type",
    ...records.map((r) => {
      const emp = r.employeeId || {};
      return [
        new Date(r.date).toLocaleDateString(),
        `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
        emp.email || "",
        emp.department || "",
        r.checkIn ? new Date(r.checkIn).toLocaleTimeString() : "",
        r.checkOut ? new Date(r.checkOut).toLocaleTimeString() : "",
        r.workingHours || 0,
        r.status,
        r.dayType || "",
      ].join(",");
    }),
  ].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=attendance.csv");
  return res.send(csv);
};
