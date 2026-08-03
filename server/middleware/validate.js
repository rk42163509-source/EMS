import { validationResult } from "express-validator";
import { errorResponse } from "../utils/helpers.js";

export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, "Validation failed", 400, errors.array());
  }
  next();
};
