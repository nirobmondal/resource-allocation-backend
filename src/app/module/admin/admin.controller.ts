import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { adminService } from "./admin.service";
import status from "http-status";

const getAdminDashboard = catchAsync(async (req: Request, res: Response) => {
  const dashboardData = await adminService.getAdminDashboard();

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin dashboard data retrieved successfully",
    data: dashboardData,
  });
});

const banUnbanUser = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isBanned } = req.body;

  await adminService.banUnbanUser(userId as string, isBanned);

  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: `User has been ${isBanned ? "banned" : "unbanned"} successfully`,
  });
});

export const adminController = {
  getAdminDashboard,
  banUnbanUser,
};
