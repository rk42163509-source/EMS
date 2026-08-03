import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { errorResponse } from "../utils/helpers.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return errorResponse(res, "Not authorized, no token", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return errorResponse(res, "User not found", 401);

    req.user = user;

    if (user.role === "EMPLOYEE") {
      const employee = await Employee.findOne({ userId: user._id, isDeleted: false });
      req.employee = employee;
    }

    next();
  } catch {
    return errorResponse(res, "Not authorized, token failed", 401);
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, "Not authorized for this action", 403);
  }
  next();
};
