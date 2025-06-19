import express from "express";
import { projectsController } from "../controllers/projectsController.js";
import { authenticateAdmin } from "../middleware/auth.js";

const router = express.Router();

// Rutas públicas de proyectos
router.get("/", projectsController.getProjects);

// Rutas públicas de artículos
router.get("/articles", projectsController.getArticles);
router.get("/articles/:id", projectsController.getArticleById);

// Rutas de administración
router.get("/admin/articles", authenticateAdmin, projectsController.getAdminArticles);
router.get("/admin/articles/:id/stats", authenticateAdmin, projectsController.getArticleStats);
router.post("/admin/articles", authenticateAdmin, projectsController.createArticle);
router.put("/admin/articles/:id", authenticateAdmin, projectsController.updateArticle);
router.delete("/admin/articles/:id", authenticateAdmin, projectsController.deleteArticle);

export default router;
