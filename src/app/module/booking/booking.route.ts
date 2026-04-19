import { Router } from "express";
import { BookingController } from "./booking.controller";

const router = Router();

router.post("/", BookingController.createBooking);
router.get("/", BookingController.getAllBookings);
router.delete("/:id", BookingController.deleteBookingById);

export const BookingRoutes = router;
