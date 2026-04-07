import status from "http-status";
import { Manufacturer } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";

const createManufacturer = async (
  payload: Manufacturer,
): Promise<Manufacturer> => {
  const manufacturer = await prisma.manufacturer.create({
    data: payload,
  });
  return manufacturer;
};

const getAllManufacturer = async (): Promise<Manufacturer[]> => {
  const manufacturer = await prisma.manufacturer.findMany();
  return manufacturer;
};

const updateManufacturer = async (
  id: string,
  payload: Manufacturer,
): Promise<Manufacturer> => {
  const manufacturer = await prisma.manufacturer.update({
    where: {
      id,
    },
    data: payload,
  });
  return manufacturer;
};

const deleteManufacturer = async (id: string): Promise<Manufacturer> => {
  const findMedicine = await prisma.medicine.findFirst({
    where: {
      manufacturerId: id,
    },
  });

  if (findMedicine) {
    throw new AppError(
      status.CONFLICT,
      "Manufacturer is associated with a medicine. Cannot delete.",
    );
  }
  const manufacturer = await prisma.manufacturer.delete({
    where: {
      id,
    },
  });
  return manufacturer;
};

export const manufacturerService = {
  createManufacturer,
  getAllManufacturer,
  updateManufacturer,
  deleteManufacturer,
};
