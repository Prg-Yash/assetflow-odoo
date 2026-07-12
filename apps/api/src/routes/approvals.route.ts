import { Router } from "express";
import {
  getApprovalRequests,
  getApprovalStats,
  createApprovalRequest,
  approveRequest,
  rejectRequest,
} from "../controllers/approvals.controller.js";
import { requireOrganization } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getApprovalRequests);
router.get("/stats", getApprovalStats);
router.post("/", createApprovalRequest);
router.post("/:id/approve", approveRequest);
router.post("/:id/reject", rejectRequest);

export default router;
