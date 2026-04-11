import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IAddToCartPayload, IUpdateCartPayload } from "./cart.interface";

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

  if (quantity <= 0) {
    throw new AppError(status.BAD_REQUEST, "Quantity must be greater than 0");
  }

  const isMedicineExist = await prisma.medicine.findUnique({
    where: {
      id: medicineId,
      isAvailable: true,
      stock: {
        gt: 0,
      },
    },
  });

  if (!isMedicineExist) {
    throw new AppError(status.NOT_FOUND, "Medicine not found");
  }

  const cart = await getOrCreateCart(userId);

  const existingCartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      medicineId,
    },
  });

  const newQuantity = existingCartItem
    ? existingCartItem.quantity + quantity
    : quantity;

  if (newQuantity > isMedicineExist.stock) {
    throw new AppError(
      status.BAD_REQUEST,
      `Only ${isMedicineExist.stock} items are available in stock`,
    );
  }

  if (existingCartItem) {
    const result = await prisma.cartItem.update({
      where: {
        id: existingCartItem.id,
      },
      data: {
        quantity: newQuantity,
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
        quantity: newQuantity,
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

const getCartItems = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          medicine: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
  });

  if (!cart || cart.cartItems.length === 0) {
    return {
      cartItems: [],
      totalPrice: 0,
    };
  }

  const totalPrice = cart.cartItems.reduce((total, item) => {
    return total + item.quantity * Number(item.medicine.price);
  }, 0);

  return {
    id: cart.id,
    cartItems: cart.cartItems,
    totalPrice,
  };
};

const updateCartItem = async (userId: string, payload: IUpdateCartPayload) => {
  const { medicineId, quantity } = payload;

  if (quantity <= 0) {
    throw new AppError(status.BAD_REQUEST, "Quantity must be greater than 0");
  }

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  const CartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      medicineId,
    },
    include: {
      medicine: {
        select: {
          stock: true,
        },
      },
    },
  });

  if (!CartItem || CartItem.quantity === 0) {
    throw new AppError(status.NOT_FOUND, "Cart item not found");
  }

  if (quantity > CartItem.medicine.stock) {
    throw new AppError(
      status.BAD_REQUEST,
      `Only ${CartItem.medicine.stock} items are available in stock`,
    );
  }

  const result = await prisma.cartItem.update({
    where: {
      id: CartItem.id,
    },
    data: {
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
};

const deleteCartItem = async (userId: string, medicineId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  const CartItem = await prisma.cartItem.findFirst({
    where: {
      cartId: cart.id,
      medicineId,
    },
  });

  if (!CartItem) {
    throw new AppError(status.NOT_FOUND, "Cart item not found");
  }

  const result = await prisma.cartItem.delete({
    where: {
      id: CartItem.id,
    },
  });

  return result;
};

const clearCart = async (userId: string) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new AppError(status.NOT_FOUND, "Cart not found");
  }

  const result = await prisma.cartItem.deleteMany({
    where: {
      cartId: cart.id,
    },
  });

  return result;
};

export const cartService = {
  addToCart,
  getCartItems,
  updateCartItem,
  deleteCartItem,
  clearCart,
};
