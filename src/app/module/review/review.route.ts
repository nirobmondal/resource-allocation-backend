import { Router } from "express";
import { reviewController } from "./review.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/:medicineId",
  checkAuth(Role.CUSTOMER),
  reviewController.createReview,
);
// medicine wise review should be public
router.get("/:medicineId", reviewController.getReviewsByMedicineId);
router.patch(
  "/:reviewId",
  checkAuth(Role.CUSTOMER),
  reviewController.updateReview,
);
router.delete(
  "/:reviewId",
  checkAuth(Role.CUSTOMER),
  reviewController.deleteReview,
);

export const reviewRoute = router;
