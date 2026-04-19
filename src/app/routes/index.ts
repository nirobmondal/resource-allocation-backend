import { Router } from "express";
import { BookingRoutes } from "../module/booking/booking.route";
import { ResourceRoutes } from "../module/resource/resource.route";

const router = Router();

router.use("/resources", ResourceRoutes);
router.use("/bookings", BookingRoutes);

export const indexRoutes = router;
