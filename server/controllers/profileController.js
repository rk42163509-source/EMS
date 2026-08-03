import Employee from "../models/Employee.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { successResponse, errorResponse } from "../utils/helpers.js";

export const getProfile = async (req, res) => {
  if (req.user.role === "ADMIN") {
    return successResponse(res, {
      user: { _id: req.user._id, email: req.user.email, role: req.user.role },
      employee: null,
    });
  }

  const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
  return successResponse(res, {
    user: { _id: req.user._id, email: req.user.email, role: req.user.role },
    employee,
  });
};

export const updateProfile = async (req, res) => {
  if (req.user.role === "ADMIN") {
    return successResponse(res, {
      user: { _id: req.user._id, email: req.user.email, role: req.user.role },
    }, "Admin profile updated");
  }

  const employee = await Employee.findOne({ userId: req.user._id, isDeleted: false });
  if (!employee) return errorResponse(res, "Employee profile not found", 404);

  const fields = ["firstName", "lastName", "phone", "bio"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) employee[f] = req.body[f];
  });

  if (req.file) employee.image = `/uploads/${req.file.filename}`;

  await employee.save();
  return successResponse(res, employee, "Profile updated");
};
