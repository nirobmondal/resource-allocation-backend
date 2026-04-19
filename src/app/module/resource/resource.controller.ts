import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ResourceService } from "./resource.service";

const createResource = catchAsync(async (req, res) => {
  const { name, type, capacity } = req.body;

  if (!name || !type || capacity === undefined) {
    throw new AppError(
      status.BAD_REQUEST,
      "name, type and capacity are required",
    );
  }

  const parsedCapacity = Number(capacity);

  if (Number.isNaN(parsedCapacity) || parsedCapacity <= 0) {
    throw new AppError(
      status.BAD_REQUEST,
      "capacity must be a positive number",
    );
  }

  const result = await ResourceService.createResource({
    name: String(name),
    type: String(type),
    capacity: parsedCapacity,
  });

  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Resource created successfully",
    data: result,
  });
});

const getAllResources = catchAsync(async (_req, res) => {
  const result = await ResourceService.getAllResources();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Resources retrieved successfully",
    data: result,
  });
});

export const ResourceController = {
  createResource,
  getAllResources,
};
