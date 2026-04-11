import { MedicineWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IOptionsResult } from "../../utils/paginationSortingFilteringHelper";
import {
  ICreateMedicinePayload,
  IUpdateMedicinePayload,
} from "./medicine.interface";

const createMedicine = async (
  payload: ICreateMedicinePayload,
  sellerId: string,
) => {
  const medicine = await prisma.medicine.create({
    data: {
      ...payload,
      sellerId,
    },
  });

  return medicine;
};

const getAllMedicines = async (query: IOptionsResult) => {
  const {
    search,
    manufacturerId,
    categoryId,
    maxPrice,
    minPrice,
    skip,
    limit,
    page,
    sortBy,
    sortOrder,
  } = query;
  const andConditions: MedicineWhereInput[] = [];

  if (search) {
    andConditions.push({
      name: {
        contains: search,
        mode: "insensitive",
      },
    });
  }

  if (manufacturerId) {
    andConditions.push({
      manufacturerId,
    });
  }

  if (categoryId) {
    andConditions.push({
      categoryId,
    });
  }

  andConditions.push({
    price: {
      gte: minPrice,
      lte: maxPrice,
    },
  });

  const medicines = await prisma.medicine.findMany({
    take: limit,
    skip,
    orderBy: {
      [sortBy]: sortOrder,
    },
    where: {
      AND: andConditions,
    },
    include: {
      category: true,
      manufacturer: true,
      seller: true,
    },
  });

  const total = await prisma.medicine.count({
    where: {
      AND: andConditions,
    },
  });

  return {
    medicines,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getMedicineById = async (medicineId: string) => {
  const medicine = await prisma.medicine.findUnique({
    where: {
      id: medicineId,
    },
    include: {
      category: true,
      manufacturer: true,
      seller: true,
    },
  });

  return medicine;
};

const getMedicineBySellerId = async (sellerId: string) => {
  const medicines = await prisma.medicine.findMany({
    where: {
      sellerId,
    },
    include: {
      category: true,
      manufacturer: true,
    },
  });

  return medicines;
};

const updateMedicine = async (
  medicineId: string,
  payload: IUpdateMedicinePayload,
) => {
  const medicine = await prisma.medicine.update({
    where: {
      id: medicineId,
    },
    data: {
      ...payload,
    },
  });

  return medicine;
};

// soft delete(set stock and price to 0 and isAvailable to false)
const deleteMedicine = async (medicineId: string) => {
  const medicine = await prisma.medicine.update({
    where: {
      id: medicineId,
    },
    data: {
      stock: 0,
      price: 0,
      isAvailable: false,
    },
  });

  return medicine;
};

export const medicineService = {
  createMedicine,
  getMedicineById,
  getAllMedicines,
  getMedicineBySellerId,
  updateMedicine,
  deleteMedicine,
};
