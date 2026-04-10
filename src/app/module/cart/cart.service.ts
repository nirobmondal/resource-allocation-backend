/**
 * 1. add to cart by user
 * 2. remove from cart by user by cardId
 * 3. get cart by user
 * 4. clear cart by user
 */

import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAddToCartPayload } from "./cart.interface";

// ── Helper: get or create cart for user ───────────────────────
const getOrCreateCart = async (userId: string) => {
  let cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  return cart;
};

const addToCart = async (userId: string, payload: IAddToCartPayload) => {
  const { medicineId, quantity } = payload;

  const isMedicineExist = await prisma.medicine.findUnique({
    where: {
      id: medicineId,
      isAvailable: true,
      stock: {
        gt: quantity,
      },
    },
  });

  if (!isMedicineExist) {
    throw new AppError(
      status.NOT_FOUND,
      "Medicine not found or quantity exceeds stock",
    );
  }

  const cart = await getOrCreateCart(userId);

  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      medicineId,
    },
  });

  if (existingCartItem) {
    const result = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: existingCartItem.quantity + quantity,
      },
      include: {
        medicine: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });
    return result;
  } else {
    const result = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        medicineId,
        quantity,
      },
      include: {
        medicine: {
          select: {
            name: true,
            price: true,
          },
        },
      },
    });
    return result;
  }
};
