import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.use(protect);

router.get("/", getProfile);
router.put("/", upload.single("image"), updateProfile);

export default router;
