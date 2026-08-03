import { Router } from "express";
import { body } from "express-validator";
import {
  getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment, assignEmployee,
} from "../controllers/departmentController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";

const router = Router();

router.use(protect);

router.get("/", getDepartments);
router.get("/:id", getDepartment);
router.post("/", authorize("ADMIN"), [body("name").notEmpty()], validate, createDepartment);
router.put("/:id", authorize("ADMIN"), updateDepartment);
router.delete("/:id", authorize("ADMIN"), deleteDepartment);
router.post("/:id/assign", authorize("ADMIN"), assignEmployee);

export default router;
