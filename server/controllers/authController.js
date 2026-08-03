import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { successResponse, errorResponse } from "../utils/helpers.js";
import { logActivity } from "../utils/activityLogger.js";

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return errorResponse(res, "Invalid email or password", 401);
  }

  let employee = null;
  if (user.role === "EMPLOYEE") {
    employee = await Employee.findOne({ userId: user._id, isDeleted: false });
    if (!employee) return errorResponse(res, "Employee profile not found", 404);
  }

  await logActivity({
    userId: user._id,
    action: "LOGIN",
    message: `${user.email} logged in`,
  });

  return successResponse(res, {
    token: generateToken(user._id),
    user: { _id: user._id, email: user.email, role: user.role },
    employee,
  }, "Login successful");
};

export const getMe = async (req, res) => {
  let employee = null;
  if (req.user.role === "EMPLOYEE") {
    employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
  }

  return successResponse(res, {
    user: { _id: req.user._id, email: req.user.email, role: req.user.role },
    employee,
  });
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (!(await bcrypt.compare(currentPassword, user.password))) {
    return errorResponse(res, "Current password is incorrect", 400);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  return successResponse(res, null, "Password changed successfully");
};
