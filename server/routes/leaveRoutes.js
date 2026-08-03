import { Router } from "express";
import { body } from "express-validator";
import {
  applyLeave, cancelLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, getLeaveStats,
} from "../controllers/leaveController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  authorize("EMPLOYEE"),
  [
    body("type").isIn(["ANNUAL", "CASUAL", "SICK"]),
    body("startDate").notEmpty(),
    body("endDate").notEmpty(),
    body("reason").notEmpty(),
  ],
  validate,
  applyLeave
);

router.get("/my", authorize("EMPLOYEE"), getMyLeaves);
router.put("/:id/cancel", authorize("EMPLOYEE"), cancelLeave);
router.get("/stats", authorize("ADMIN"), getLeaveStats);
router.get("/", authorize("ADMIN"), getAllLeaves);
router.put("/:id/status", authorize("ADMIN"), updateLeaveStatus);

export default router;
