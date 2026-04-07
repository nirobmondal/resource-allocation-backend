import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../shared/sendResponse";
import { Request, Response } from "express";

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const result = await categoryService.createCategory(payload);
  sendResponse(res, {
    httpStatusCode: status.CREATED,
    success: true,
    message: "Category created successfully",
    data: result,
  });
});

const getAllCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await categoryService.getAllCategory();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category retrieved successfully",
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const result = await categoryService.updateCategory(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category updated successfully",
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await categoryService.deleteCategory(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Category deleted successfully",
    data: result,
  });
});

export const categoryController = {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategory,
};
