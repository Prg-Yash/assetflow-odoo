import { Router } from "express";
import {
  getAssets,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  addAssetImage,
  addAssetDocument,
  scanQRCode,
} from "../controllers/assets.controller.js";
import { requireOrganization, requireRoleType } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getAssets);
router.get("/scan/:code", scanQRCode);
router.get("/:id", getAssetById);
router.post("/", requireRoleType("ADMIN", "ASSET_MANAGER"), createAsset);
router.patch("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), updateAsset);
router.delete("/:id", requireRoleType("ADMIN", "ASSET_MANAGER"), deleteAsset);
router.post("/:id/images", requireRoleType("ADMIN", "ASSET_MANAGER"), addAssetImage);
router.post("/:id/documents", requireRoleType("ADMIN", "ASSET_MANAGER"), addAssetDocument);

export default router;
