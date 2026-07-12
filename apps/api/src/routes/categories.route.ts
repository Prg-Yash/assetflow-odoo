import { Router } from "express";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../controllers/categories.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getCategories);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createCategory);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updateCategory);
router.delete("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), deleteCategory);

export default router;
