import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req, res) => {
  const { resourceId, requestedBy, bookingDate } = req.body;

  if (!resourceId || !requestedBy || !bookingDate) {
    throw new AppError(
      status.BAD_REQUEST,
      "resourceId, requestedBy and bookingDate are required",
    );
  }

  const result = await BookingService.createBooking({
    resourceId: String(resourceId),
    requestedBy: String(requestedBy),
    bookingDate: String(bookingDate),
  });

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getAllBookings = catchAsync(async (_req, res) => {
  const result = await BookingService.getAllBookings();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Bookings retrieved successfully",
    data: result,
  });
});

const deleteBookingById = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id || Array.isArray(id)) {
    throw new AppError(status.BAD_REQUEST, "Booking id is required");
  }

  const result = await BookingService.deleteBookingById(id);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Booking deleted successfully",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getAllBookings,
  deleteBookingById,
};
