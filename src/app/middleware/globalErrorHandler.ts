import { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errorHelpers/AppError";

export const globalErrorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  if (err instanceof Error) {
    const errorWithCode = err as Error & { code?: string };

    if (errorWithCode.code === "ETIMEDOUT") {
      return res.status(status.SERVICE_UNAVAILABLE).json({
        success: false,
        message:
          "Database connection timed out. Please check DATABASE_URL, internet connection, and database availability.",
      });
    }

    return res.status(status.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: err.message,
    });
  }

  return res.status(status.INTERNAL_SERVER_ERROR).json({
    success: false,
    message: "Internal Server Error",
  });
};
