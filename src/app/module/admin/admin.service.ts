/**
 * 1. Admin DashBoard(see total customer, total seller, total admin, total medicine, total order)
 * 2. manage user (ban/unban)
 */

import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const getAdminDashboard = async () => {
  const totalCustomer = await prisma.user.count({
    where: {
      role: Role.CUSTOMER,
    },
  });
  const totalSeller = await prisma.user.count({
    where: {
      role: Role.SELLER,
    },
  });
  const totalAdmin = await prisma.user.count({
    where: {
      role: Role.ADMIN,
    },
  });
  const totalMedicine = await prisma.medicine.count();
  const totalOrder = await prisma.order.count();

  return {
    totalCustomer,
    totalSeller,
    totalAdmin,
    totalMedicine,
    totalOrder,
  };
};

const banUnbanUser = async (userId: string, isBanned: boolean) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isBanned,
    },
  });
};

export const adminService = {
  getAdminDashboard,
  banUnbanUser,
};
