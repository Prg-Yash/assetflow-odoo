import { Router } from "express";
import { getEmployees, getEmployeeById, updateEmployee, promoteEmployee } from "../controllers/employees.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getEmployees);
router.get("/:id", getEmployeeById);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updateEmployee);
router.patch("/:id/promote", requireRoleType("ADMIN"), promoteEmployee);

export default router;
