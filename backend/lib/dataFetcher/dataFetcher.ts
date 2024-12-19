import { Model, FilterQuery, SortOrder } from "mongoose";
import { DataFetcherParams, PopulateOption, DataFetcherResult } from "./types";

// Main DataFetcher Function
const dataFetcher = async <T>({
  model,
  filters = {},
  page = 1,
  perPage = 10,
  populate = null,
  fields = null,
  sort = null,
}: DataFetcherParams<T>): Promise<DataFetcherResult<T>> => {
  try {
    const skip = (page - 1) * perPage;
    const pipeline: any[] = [];

    // 1. Handle Text Search
    const { textSearch, nonTextFilters } = buildTextSearch(filters);
    if (textSearch) pipeline.push({ $match: textSearch });

    // 2. Add Lookups for References
    const lookupStages = buildLookups(populate);
    pipeline.push(...lookupStages);

    // 3. Add Filtering
    if (Object.keys(nonTextFilters).length > 0) {
      pipeline.push({ $match: nonTextFilters });
    }

    // 4. Add Projection
    const projection = buildProjection(model, fields, populate);
    if (Object.keys(projection).length > 0) {
      pipeline.push({ $project: projection });
    }

    // 5. Add Sorting
    const sortStage = buildSort(sort);
    if (sortStage) pipeline.push(sortStage);

    // 6. Add Pagination
    pipeline.push(...buildPagination(skip, perPage));

    // Execute the aggregation pipeline
    const results = await model.aggregate(pipeline).exec();

    // Count total records without pagination
    const totalRecords = await getTotalRecords(model, filters, populate);

    return { results, totalRecords };
  } catch (error) {
    console.error("Error in dataFetcher:", error);
    throw error;
  }
};

const getTotalRecords = async <T>(
  model: Model<T>,
  filters: FilterQuery<T>,
  populate: PopulateOption[] | null
): Promise<number> => {
  const pipeline: any[] = [];

  // 1. Handle Text Search
  const { textSearch, nonTextFilters } = buildTextSearch(filters);
  if (textSearch) pipeline.push({ $match: textSearch });

  // 2. Add Lookups for References
  const lookupStages = buildLookups(populate);
  pipeline.push(...lookupStages);

  // 3. Add Filtering
  if (Object.keys(nonTextFilters).length > 0) {
    pipeline.push({ $match: nonTextFilters });
  }

  // 4. Count the total documents
  pipeline.push({ $count: "total" });

  const result = await model.aggregate(pipeline).exec();
  return result.length > 0 ? result[0].total : 0;
};


// Helper: Build Text Search
const buildTextSearch = <T>(filters: FilterQuery<T>) => {
  const textSearch = filters.$text ? { $text: filters.$text } : null;
  const nonTextFilters = { ...filters };
  delete nonTextFilters.$text;
  return { textSearch, nonTextFilters };
};

// Helper: Build Lookups for References
const buildLookups = (populate: PopulateOption[] | null) => {
  const lookupStages: any[] = [];

  if (populate) {
    populate.forEach((pop) => {
      lookupStages.push({
        $lookup: {
          from: pop.from,
          localField: pop.localField || pop.path,
          foreignField: pop.foreignField || "_id",
          as: pop.path,
        },
      });

      // Handle null or empty references
      lookupStages.push({
        $unwind: {
          path: `$${pop.path}`,
          preserveNullAndEmptyArrays: true,
        },
      });
    });
  }

  return lookupStages;
};

// Helper: Build Projection
const buildProjection = (
  model: Model<any>,
  select: string | null,
  populate: PopulateOption[] | null
) => {
  const projection: Record<string, number> = {};

  // Add main model fields
  if (select) {
    select.split(" ").forEach((field) => {
      projection[field] = 1;
    });
  } else {
    Object.keys(model.schema.paths).forEach((field) => {
      if (field !== "__v") projection[field] = 1;
    });
  }

  // Add referenced model fields
  if (populate) {
    populate.forEach((pop) => {
      pop.select.split(" ").forEach((refField) => {
        projection[`${pop.path}.${refField}`] = 1;
      });
      delete projection[pop.path]; // Prevent collisions
    });
  }

  return projection;
};

// Helper: Build Sorting Stage
const buildSort = (sort: Record<string, SortOrder> | null) => {
  if (sort && Object.keys(sort).length > 0) {
    return { $sort: sort };
  }
  return null;
};

// Helper: Build Pagination
const buildPagination = (skip: number, perPage: number) => [
  { $skip: skip },
  { $limit: perPage },
];

export default dataFetcher;
