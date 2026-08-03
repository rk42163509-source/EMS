import { Router } from "express";
import { body } from "express-validator";
import {
  getEmployees, getEmployee, createEmployee, updateEmployee, deleteEmployee,
} from "../controllers/employeeController.js";
import { protect, authorize } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(protect, authorize("ADMIN"));

router.get("/", getEmployees);
router.get("/:id", getEmployee);
router.post(
  "/",
  upload.single("image"),
  [
    body("firstName").notEmpty(),
    body("lastName").notEmpty(),
    body("email").isEmail(),
  ],
  validate,
  createEmployee
);
router.put("/:id", upload.single("image"), updateEmployee);
router.delete("/:id", deleteEmployee);

export default router;
