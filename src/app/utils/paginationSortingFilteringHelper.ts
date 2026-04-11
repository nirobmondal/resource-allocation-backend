type IOptions = {
  search?: string;
  manufacturerId?: string;
  categoryId?: string;
  maxPrice?: number | string;
  minPrice?: number | string;
  sortOrder?: string;
  sortBy?: string;
  page?: number | string;
  limit?: number | string;
};

export type IOptionsResult = {
  search?: string;
  manufacturerId?: string;
  categoryId?: string;
  maxPrice?: number | string;
  minPrice?: number | string;
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const paginationSortingFilteringHelper = (
  options: IOptions,
): IOptionsResult => {
  const search: string = options.search || "";
  const manufacturerId: string = options.manufacturerId || "";
  const categoryId: string = options.categoryId || "";
  const maxPrice: number = Number(options.maxPrice) || Infinity;
  const minPrice: number = Number(options.minPrice) || 0;
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const skip = (page - 1) * limit;

  const sortBy: string = options.sortBy || "createdAt";
  const sortOrder: string = options.sortOrder || "desc";
  return {
    search,
    manufacturerId,
    categoryId,
    maxPrice,
    minPrice,
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export default paginationSortingFilteringHelper;
