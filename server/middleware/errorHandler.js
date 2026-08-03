import { errorResponse } from "../utils/helpers.js";

export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return errorResponse(res, messages.join(", "), 400);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists`, 400);
  }

  if (err.name === "CastError") {
    return errorResponse(res, "Invalid ID format", 400);
  }

  return errorResponse(res, err.message || "Server error", err.statusCode || 500);
};

export const notFound = (req, res) => {
  return errorResponse(res, `Route ${req.originalUrl} not found`, 404);
};
