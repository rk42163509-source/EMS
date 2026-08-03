import { Router } from "express";
import { getAdminDashboard, getEmployeeDashboard } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/auth.js";

const router = Router();

router.get("/admin", protect, authorize("ADMIN"), getAdminDashboard);
router.get("/employee", protect, authorize("EMPLOYEE"), getEmployeeDashboard);

export default router;
