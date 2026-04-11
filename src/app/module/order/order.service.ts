import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { cartService } from "../cart/cart.service";
import { ICreateOrderPayload } from "./order.interface";
import { OrderStatus, PaymentStatus } from "../../../generated/prisma/enums";

// Valid status transitions
const STATUS_FLOW: Record<OrderStatus, OrderStatus | null> = {
  PLACED: OrderStatus.PROCESSING,
  PROCESSING: OrderStatus.SHIPPED,
  SHIPPED: OrderStatus.DELIVERED,
  DELIVERED: null,
  CANCELLED: null,
};

// Statuses that can be cancelled
const CANCELLABLE: OrderStatus[] = [OrderStatus.PLACED, OrderStatus.PROCESSING];

// get seller id from user id
async function getSellerId(userId: string): Promise<string> {
  const profile = await prisma.seller.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!profile) {
    throw new AppError(status.NOT_FOUND, "Seller profile not found");
  }

  return profile.id;
}

const placeOrder = async (userId: string, payload: ICreateOrderPayload) => {
  // 1. Get user's cart and cart items
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      cartItems: {
        include: {
          medicine: {
            select: {
              sellerId: true,
              price: true,
              stock: true,
              isAvailable: true,
            },
          },
        },
      },
    },
  });

  // 2. Validate cart and cart items
  if (!cart || cart.cartItems.length === 0) {
    throw new AppError(status.BAD_REQUEST, "Cart is empty");
  }

  // 3. Validate medicine stock and availability
  for (const cartItem of cart.cartItems) {
    if (!cartItem.medicine.isAvailable) {
      throw new AppError(
        status.BAD_REQUEST,
        `Medicine with id ${cartItem.medicineId} is not available`,
      );
    }

    if (cartItem.quantity > cartItem.medicine.stock) {
      throw new AppError(
        status.BAD_REQUEST,
        `Not enough stock for medicine with id ${cartItem.medicineId}`,
      );
    }
  }

  // 4. totalAmount = sum of (price * quantity) for each cart item
  const totalAmount = cart.cartItems.reduce((total, cartItem) => {
    return total + Number(cartItem.medicine.price) * Number(cartItem.quantity);
  }, 0);

  // 5. group items for each seller
  const itemsBySeller: Map<
    string,
    { medicineId: string; quantity: number; price: number }[]
  > = new Map();

  for (const cartItem of cart.cartItems) {
    const sellerId = cartItem.medicine.sellerId;
    if (!itemsBySeller.has(sellerId)) {
      itemsBySeller.set(sellerId, []);
    }
    itemsBySeller.get(sellerId)?.push({
      medicineId: cartItem.medicineId,
      quantity: cartItem.quantity,
      price: Number(cartItem.medicine.price) * Number(cartItem.quantity),
    });
  }

  // 6. Create order, order items, reduce stock, clear cart — all in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // i. create order
    const newOrder = await tx.order.create({
      data: {
        userId,
        shippingAddress: payload.shippingAddress,
        shippingCity: payload.shippingCity,
        phone: payload.phone,
        notes: payload.notes ?? null,
        totalAmount,
        status: OrderStatus.PLACED,
      },
    });

    // ii. create seller orders and order items
    for (const [sellerId, items] of itemsBySeller.entries()) {
      await tx.sellerOrder.create({
        data: {
          orderId: newOrder.id,
          sellerId,
          totalAmount: items.reduce((sum, item) => sum + item.price, 0),
          orderItems: {
            create: items.map((item) => ({
              medicineId: item.medicineId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    }

    // iii. reduce stock for each medicine
    for (const cartItem of cart.cartItems) {
      await tx.medicine.update({
        where: {
          id: cartItem.medicineId,
        },
        data: {
          stock: {
            decrement: cartItem.quantity,
          },
        },
      });
    }

    // iv. clear cart
    await cartService.clearCart(userId);

    return newOrder;
  });

  const fullOder = await prisma.order.findUnique({
    where: {
      id: order.id,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  return fullOder;
};

const getAllOrders = async () => {
  return await prisma.order.findMany({
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });
};

const getOrderById = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  return order;
};

const getOrderByUserId = async (userId: string) => {
  return await prisma.order.findMany({
    where: {
      userId,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });
};

const getOrderBySellerId = async (userId: string) => {
  const sellerId = await getSellerId(userId);

  return await prisma.sellerOrder.findMany({
    where: {
      sellerId,
    },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              name: true,
              imageUrl: true,
              price: true,
            },
          },
          quantity: true,
          price: true,
        },
      },
      order: {
        select: {
          id: true,
          userId: true,
          shippingAddress: true,
          shippingCity: true,
          phone: true,
          notes: true,
          totalAmount: true,
          status: true,
        },
      },
    },
  });
};

const getOrderBySellerOrderId = async (sellerOrderId: string) => {
  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: {
      id: sellerOrderId,
    },
    include: {
      orderItems: {
        include: {
          medicine: {
            select: {
              name: true,
              imageUrl: true,
              price: true,
            },
          },
          quantity: true,
          price: true,
        },
      },
      order: {
        select: {
          id: true,
          userId: true,
          shippingAddress: true,
          shippingCity: true,
          phone: true,
          notes: true,
          totalAmount: true,
          status: true,
        },
      },
    },
  });

  if (!sellerOrder) {
    throw new AppError(status.NOT_FOUND, "Seller order not found");
  }

  return sellerOrder;
};

const cancelOrder = async (orderId: string, userId: string) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: true,
          status: true,
        },
      },
    },
  });

  if (!order) {
    throw new AppError(status.NOT_FOUND, "Order not found");
  }

  // cancel order only oder with PLACED status
  if (order.status !== OrderStatus.PLACED) {
    throw new AppError(
      status.BAD_REQUEST,
      `Order cannot be cancelled from ${order.status} status`,
    );
  }

  await prisma.$transaction(async (tx) => {
    // Update order status
    await tx.order.update({
      where: {
        id: orderId,
      },
      data: {
        status: OrderStatus.CANCELLED,
      },
    });

    for (const sellerOrder of order.sellerOrders) {
      // Restore stock for each medicine
      for (const orderItem of sellerOrder.orderItems) {
        await tx.medicine.update({
          where: {
            id: orderItem.medicineId,
          },
          data: {
            stock: {
              increment: orderItem.quantity,
            },
          },
        });
      }
    }
  });

  const fullOder = await prisma.order.findUnique({
    where: {
      id: order.id,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });

  return fullOder;
};

const updateSellerOrderStatus = async (
  userId: string,
  sellerOrderId: string,
  newStatus: OrderStatus,
) => {
  const sellerId = await getSellerId(userId);

  const sellerOrder = await prisma.sellerOrder.findUnique({
    where: {
      id: sellerOrderId,
    },
    select: {
      orderId: true,
      status: true,
      sellerId: true,
      orderItems: {
        select: {
          medicineId: true,
          quantity: true,
        },
      },
      order: {
        select: {
          status: true,
        },
      },
    },
  });

  if (!sellerOrder) {
    throw new AppError(status.NOT_FOUND, "Seller order not found");
  }

  if (sellerOrder.sellerId !== sellerId) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not authorized to update this order",
    );
  }

  const currentStatus = sellerOrder.order.status;

  // Check if the new status is a valid transition
  if (!STATUS_FLOW[currentStatus] || STATUS_FLOW[currentStatus] !== newStatus) {
    throw new AppError(
      status.BAD_REQUEST,
      `Invalid status transition from ${currentStatus} to ${newStatus}`,
    );
  }

  /**
   * if new status is cancelled, then check if it is valid order
   * then update the order status to cancelled and restore the stock for each medicine in the order
   * if new status is delivered,  update the order status to delivered and payment status to paid
   * else just update the order status to new status
   * all these should be done in a transaction
   */

  if (newStatus === OrderStatus.CANCELLED) {
    if (!CANCELLABLE.includes(currentStatus)) {
      throw new AppError(
        status.BAD_REQUEST,
        `Order cannot be cancelled from ${currentStatus} status`,
      );
    }

    await prisma.$transaction(async (tx) => {
      // update oder table status
      await tx.order.update({
        where: {
          id: sellerOrder.orderId,
        },
        data: {
          status: newStatus,
        },
      });

      // restore medicine stock
      for (const orderItem of sellerOrder.orderItems) {
        await tx.medicine.update({
          where: {
            id: orderItem.medicineId,
          },
          data: {
            stock: {
              increment: orderItem.quantity,
            },
          },
        });
      }
    });
  } else if (newStatus === OrderStatus.DELIVERED) {
    await prisma.order.update({
      where: {
        id: sellerOrder.orderId,
      },
      data: {
        status: newStatus,
        paymentStatus: PaymentStatus.PAID,
      },
    });
  } else {
    await prisma.order.update({
      where: {
        id: sellerOrder.orderId,
      },
      data: {
        status: newStatus,
      },
    });
  }

  const fullOder = await prisma.order.findUnique({
    where: {
      id: sellerOrder.orderId,
    },
    include: {
      sellerOrders: {
        include: {
          orderItems: {
            include: {
              medicine: {
                select: {
                  name: true,
                  imageUrl: true,
                  price: true,
                },
              },
              quantity: true,
              price: true,
            },
          },
          seller: {
            select: {
              id: true,
              storeName: true,
            },
          },
        },
      },
    },
  });
  return fullOder;
};

export const orderService = {
  placeOrder,
  getAllOrders,
  getOrderById,
  getOrderByUserId,
  getOrderBySellerId,
  getOrderBySellerOrderId,
  cancelOrder,
  updateSellerOrderStatus,
};
