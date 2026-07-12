import { Router } from "express";
import { getPurchases, createPurchase, updatePurchase, deletePurchase } from "../controllers/purchases.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getPurchases);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createPurchase);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updatePurchase);
router.delete("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), deletePurchase);

export default router;
