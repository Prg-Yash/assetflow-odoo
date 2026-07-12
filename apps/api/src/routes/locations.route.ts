import { Router } from "express";
import { getLocations, createLocation, updateLocation, deleteLocation } from "../controllers/locations.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getLocations);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createLocation);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updateLocation);
router.delete("/:id", requireRoleType("ADMIN"), deleteLocation);

export default router;
