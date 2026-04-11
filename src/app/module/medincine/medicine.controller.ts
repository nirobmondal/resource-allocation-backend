import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { medicineService } from "./medicine.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import paginationSortingFilteringHelper from "../../utils/paginationSortingFilteringHelper";

const createMedicine = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const payload = req.body;

  const medicine = await medicineService.createMedicine(payload, userId);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Medicine created successfully",
    data: medicine,
  });
});

const getMedicineById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;

  const medicine = await medicineService.getMedicineById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Medicine fetched successfully",
    data: medicine,
  });
});

const getAllMedicines = catchAsync(async (req: Request, res: Response) => {
  const query = paginationSortingFilteringHelper(req.query);
  const medicines = await medicineService.getAllMedicines(query);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Medicines fetched successfully",
    data: medicines,
  });
});

const getMedicineBySellerId = catchAsync(
  async (req: Request, res: Response) => {
    const { userId } = req.user;
    const medicines = await medicineService.getMedicineBySellerId(userId);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Medicines fetched successfully",
      data: medicines,
    });
  },
);

const updateMedicine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;

  const medicine = await medicineService.updateMedicine(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Medicine updated successfully",
    data: medicine,
  });
});

const deleteMedicine = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const medicine = await medicineService.deleteMedicine(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Medicine deleted successfully",
    data: medicine,
  });
});

export const medicineController = {
  createMedicine,
  getMedicineById,
  getAllMedicines,
  getMedicineBySellerId,
  updateMedicine,
  deleteMedicine,
};
