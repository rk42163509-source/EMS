import Employee from "../models/Employee.js";
import User from "../models/User.js";
import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import Payslip from "../models/Payslip.js";
import Department from "../models/Department.js";
import Activity from "../models/Activity.js";
import { successResponse, errorResponse, startOfDay, endOfDay } from "../utils/helpers.js";

export const getAdminDashboard = async (req, res) => {
  const today = startOfDay();
  const todayEnd = endOfDay();

  const [totalEmployees, totalDepartments, todayAttendance, pendingLeaves, recentActivities] =
    await Promise.all([
      Employee.countDocuments({ isDeleted: false, employmentStatus: "ACTIVE" }),
      Department.countDocuments(),
      Attendance.countDocuments({ date: { $gte: today, $lte: todayEnd }, status: "PRESENT" }),
      Leave.countDocuments({ status: "PENDING" }),
      Activity.find().sort({ createdAt: -1 }).limit(8).populate("userId", "email role"),
    ]);

  const totalActive = await Employee.countDocuments({ isDeleted: false, employmentStatus: "ACTIVE" });
  const absentToday = Math.max(0, totalActive - todayAttendance);

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const attendanceChart = await Attendance.aggregate([
    { $match: { date: { $gte: sixMonthsAgo }, status: "PRESENT" } },
    {
      $group: {
        _id: { year: { $year: "$date" }, month: { $month: "$date" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const leaveStats = await Leave.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const payrollChart = await Payslip.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: "$year", month: "$month" },
        total: { $sum: "$netSalary" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  return successResponse(res, {
    role: "ADMIN",
    totalEmployees,
    totalDepartments,
    presentToday: todayAttendance,
    absentToday,
    pendingLeaves,
    recentActivities,
    charts: { attendanceChart, leaveStats, payrollChart },
  });
};

export const getEmployeeDashboard = async (req, res) => {
  const employee = req.employee;
  if (!employee) return errorResponse(res, "Employee profile not found", 404);

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [currentMonthAttendance, pendingLeaves, latestPayslip] = await Promise.all([
    Attendance.countDocuments({
      employeeId: employee._id,
      date: { $gte: monthStart, $lte: monthEnd },
      status: "PRESENT",
    }),
    Leave.countDocuments({ employeeId: employee._id, status: "PENDING" }),
    Payslip.findOne({ employeeId: employee._id }).sort({ year: -1, month: -1 }),
  ]);

  return successResponse(res, {
    role: "EMPLOYEE",
    currentMonthAttendance,
    pendingLeaves,
    latestPayslip,
    leaveBalance: {
      annual: employee.annualLeaveBalance,
      casual: employee.casualLeaveBalance,
      sick: employee.sickLeaveBalance,
    },
    employee,
  });
};
