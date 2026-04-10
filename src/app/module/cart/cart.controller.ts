import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { cartService } from "./cart.service";

const addToCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const payload = req.body;

  const result = await cartService.addToCart(userId, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Item added to cart successfully",
    data: result,
  });
});

const getCartItems = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const result = await cartService.getCartItems(userId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart items fetched successfully",
    data: result,
  });
});

const updateCartItem = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const payload = req.body;

  const result = await cartService.updateCartItem(userId, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart item updated successfully",
    data: result,
  });
});

const deleteCartItem = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;
  const { medicineId } = req.params;

  const result = await cartService.deleteCartItem(userId, medicineId as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart item deleted successfully",
    data: result,
  });
});

const clearCart = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.user;

  const result = await cartService.clearCart(userId);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Cart cleared successfully",
    data: result,
  });
});

export const cartController = {
  addToCart,
  getCartItems,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
