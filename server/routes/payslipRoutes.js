import { Router } from "express";
import { body } from "express-validator";
import {
  generatePayslip, getAllPayslips, getMyPayslips, getPayslip,
} from "../controllers/payslipController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/my", authorize("EMPLOYEE"), getMyPayslips);
router.get("/:id", getPayslip);
router.get("/", authorize("ADMIN"), getAllPayslips);
router.post(
  "/generate",
  authorize("ADMIN"),
  [
    body("employeeId").notEmpty(),
    body("month").isInt({ min: 1, max: 12 }),
    body("year").isInt({ min: 2000 }),
  ],
  validate,
  generatePayslip
);

export default router;
