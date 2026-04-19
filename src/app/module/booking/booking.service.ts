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

  const startOfBookingDay = new Date(
    Date.UTC(
      parsedDate.getUTCFullYear(),
      parsedDate.getUTCMonth(),
      parsedDate.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  const currentDate = new Date();
  const startOfCurrentDay = new Date(
    Date.UTC(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );

  if (startOfBookingDay.getTime() < startOfCurrentDay.getTime()) {
    throw new AppError(status.BAD_REQUEST, "bookingDate cannot be in the past");
  }

  return {
    parsedDate,
    startOfBookingDay,
  };
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

  const { parsedDate, startOfBookingDay } = getUtcDayRange(bookingDate);
  const endOfBookingDay = new Date(startOfBookingDay);
  endOfBookingDay.setUTCDate(endOfBookingDay.getUTCDate() + 1);

  const existingBooking = await prisma.booking.findFirst({
    where: {
      resourceId,
      bookingDate: {
        gte: startOfBookingDay,
        lt: endOfBookingDay,
      },
      status: {
        not: "CANCELLED",
      },
    },
  });

  if (existingBooking) {
    throw new AppError(
      status.CONFLICT,
      "This resource is already booked for the selected day",
    );
  }

  const result = await prisma.booking.create({
    data: {
      resourceId,
      requestedBy,
      bookingDate: parsedDate,
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
