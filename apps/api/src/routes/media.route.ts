import { Router } from "express";
import {
	createMediaDownloadUrl,
	createUploadPresign,
	listAllMedia,
	listMediaByFolder,
	removeMediaObject,
} from "../controllers/media.controller.js";

const router = Router();

router.get("/", listAllMedia);
router.get("/folders/:folder", listMediaByFolder);
router.get("/download", createMediaDownloadUrl);
router.delete("/:key(*)", removeMediaObject);

router.post("/uploads/presign", createUploadPresign);

export default router;