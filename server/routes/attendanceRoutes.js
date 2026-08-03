import { Router } from "express";
import {
  checkIn, checkOut, getTodayAttendance, getMyAttendance, getAllAttendance, exportAttendance,
} from "../controllers/attendanceController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.use(protect);

router.post("/check-in", authorize("EMPLOYEE"), checkIn);
router.post("/check-out", authorize("EMPLOYEE"), checkOut);
router.get("/today", authorize("EMPLOYEE"), getTodayAttendance);
router.get("/my", authorize("EMPLOYEE"), getMyAttendance);
router.get("/export", authorize("ADMIN"), exportAttendance);
router.get("/", authorize("ADMIN"), getAllAttendance);

export default router;
