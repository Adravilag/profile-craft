import express from "express";
import { profileController } from "../controllers/profileController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas
router.get("/:id", profileController.getProfile);

// Rutas autenticadas
router.get("/auth/profile", authenticateAdmin, profileController.getAuthProfile);
router.put("/auth/profile", authenticateAdmin, profileController.updateProfile);

export default router;
