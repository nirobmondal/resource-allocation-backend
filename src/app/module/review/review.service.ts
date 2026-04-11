import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { ICreateReviewPayload, IUpdateReviewPayload } from "./review.interface";
import { OrderStatus, Role } from "../../../generated/prisma/enums";

const createReview = async (
  userId: string,
  medicineId: string,
  payload: ICreateReviewPayload,
) => {
  const { rating, comment } = payload;
  const isMedicineExist = await prisma.medicine.findUnique({
    where: { id: medicineId },
  });

  if (!isMedicineExist) {
    throw new AppError(status.NOT_FOUND, "Medicine not found");
  }

  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      medicineId,
    },
  });

  if (existingReview) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already reviewed this medicine",
    );
  }

  // check if user has purchased the medicine
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      medicineId,
      sellerOrder: {
        order: {
          userId,
          status: OrderStatus.DELIVERED,
        },
      },
    },
  });

  if (!hasPurchased) {
    throw new AppError(
      status.BAD_REQUEST,
      "You can only review medicines that you have purchased",
    );
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      userId,
      medicineId,
    },
  });

  return review;
};

const getReviewsByMedicineId = async (medicineId: string) => {
  const reviews = await prisma.review.findMany({
    where: { medicineId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return reviews;
};

const updateReview = async (
  reviewId: string,
  userId: string,
  role: Role,
  payload: IUpdateReviewPayload,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId && role !== Role.ADMIN) {
    throw new AppError(status.FORBIDDEN, "You can only update your own review");
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });

  return updatedReview;
};

const deleteReview = async (reviewId: string, userId: string, role: Role) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId && role !== Role.ADMIN) {
    throw new AppError(status.FORBIDDEN, "You can only delete your own review");
  }

  const result = await prisma.review.delete({
    where: { id: reviewId },
  });

  return result;
};

export const reviewService = {
  createReview,
  getReviewsByMedicineId,
  updateReview,
  deleteReview,
};
