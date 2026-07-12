import { Router } from "express";
import { getVendors, createVendor, updateVendor, deleteVendor } from "../controllers/vendors.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getVendors);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createVendor);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updateVendor);
router.delete("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), deleteVendor);

export default router;
