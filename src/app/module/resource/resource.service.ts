import { prisma } from "../../lib/prisma";

interface ICreateResourcePayload {
  name: string;
  type: string;
  capacity: number;
}

const createResource = async (payload: ICreateResourcePayload) => {
  const result = await prisma.resource.create({
    data: payload,
  });

  return result;
};

const getAllResources = async () => {
  const result = await prisma.resource.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return result;
};

export const ResourceService = {
  createResource,
  getAllResources,
};
