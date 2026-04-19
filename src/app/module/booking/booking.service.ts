import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

interface ICreateBookingPayload {
  resourceId: string;
  requestedBy: string;
  bookingDate: string;
}

const getUtcDayRange = (dateString: string) => {
  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    throw new AppError(status.BAD_REQUEST, "bookingDate must be a valid date");
  }

  if (parsedDate.getTime() <= Date.now()) {
    throw new AppError(
      status.BAD_REQUEST,
      "bookingDate must be greater than current time",
    );
  }

  return parsedDate;
};

const createBooking = async (payload: ICreateBookingPayload) => {
  const { resourceId, requestedBy, bookingDate } = payload;

  const resource = await prisma.resource.findUnique({
    where: {
      id: resourceId,
    },
  });

  if (!resource) {
    throw new AppError(status.NOT_FOUND, "Resource not found");
  }

  const parsedBookingDate = getUtcDayRange(bookingDate);

  const result = await prisma.booking.create({
    data: {
      resourceId,
      requestedBy,
      bookingDate: parsedBookingDate,
    },
    include: {
      resource: true,
    },
  });

  return result;
};

const getAllBookings = async () => {
  const result = await prisma.booking.findMany({
    include: {
      resource: true,
    },
    orderBy: {
      bookingDate: "desc",
    },
  });

  return result;
};

const deleteBookingById = async (id: string) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id,
    },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  const result = await prisma.booking.delete({
    where: {
      id,
    },
  });

  return result;
};

export const BookingService = {
  createBooking,
  getAllBookings,
  deleteBookingById,
};
