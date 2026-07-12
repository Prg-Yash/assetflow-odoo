import { Router } from "express";
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from "../controllers/departments.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getDepartments);
router.post("/", requireRoleType("ADMIN"), createDepartment);
router.patch("/:id", requireRoleType("ADMIN"), updateDepartment);
router.delete("/:id", requireRoleType("ADMIN"), deleteDepartment);

export default router;
