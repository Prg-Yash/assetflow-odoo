import { Router } from "express";
import { getBookings, getAssetCalendar, createBooking, cancelBooking } from "../controllers/bookings.controller.js";
import { requireOrganization } from "../middleware/auth.middleware.js";

const router = Router();

router.use(requireOrganization);

router.get("/", getBookings);
router.get("/calendar/:assetId", getAssetCalendar);
router.post("/", createBooking);
router.patch("/:id/cancel", cancelBooking);

export default router;
