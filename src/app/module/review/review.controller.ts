import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { reviewService } from "./review.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const createReview = catchAsync(async (req: Request, res: Response) => {
  const { medicineId } = req.params;
  const { userId } = req.user;
  const payload = req.body;

  const result = await reviewService.createReview(
    userId,
    medicineId as string,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const getReviewsByMedicineId = catchAsync(
  async (req: Request, res: Response) => {
    const { medicineId } = req.params;

    const reviews = await reviewService.getReviewsByMedicineId(
      medicineId as string,
    );

    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Reviews retrieved successfully",
      data: reviews,
    });
  },
);

const updateReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { userId, role } = req.user;
  const payload = req.body;

  const updatedReview = await reviewService.updateReview(
    reviewId as string,
    userId,
    role,
    payload,
  );

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Review updated successfully",
    data: updatedReview,
  });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
  const { reviewId } = req.params;
  const { userId, role } = req.user;

  await reviewService.deleteReview(reviewId as string, userId, role);

  sendResponse(res, {
    httpStatusCode: status.NO_CONTENT,
    success: true,
    message: "Review deleted successfully",
  });
});

export const reviewController = {
  createReview,
  getReviewsByMedicineId,
  updateReview,
  deleteReview,
};
