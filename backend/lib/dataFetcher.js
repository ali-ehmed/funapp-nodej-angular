const dataFetcher = async ({
  model,
  filters = {},
  page = 1,
  perPage = 10,
  populate = null,
  fields = null,
  sort = null,
}) => {
  try {
    const skip = (page - 1) * perPage;
    const pipeline = [];

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

    // Debugging: Print the generated pipeline
    // console.log('Generated Pipeline:', JSON.stringify(pipeline, null, 2));

    // Execute the aggregation pipeline
    const results = await model.aggregate(pipeline).exec();

    // Count total records without pagination
    const totalRecords = await model.countDocuments(nonTextFilters);

    return { results, totalRecords };
  } catch (error) {
    console.error('Error in queryBuilder:', error);
    throw error;
  }
};

const buildTextSearch = (filters) => {
  const textSearch = filters.$text ? { $text: filters.$text } : null;
  const nonTextFilters = { ...filters };
  delete nonTextFilters.$text;
  return { textSearch, nonTextFilters };
};

const buildLookups = (populate) => {
  const lookupStages = [];

  if (populate) {
    populate.forEach((pop) => {
      lookupStages.push({
        $lookup: {
          from: pop.from,
          localField: pop.localField || pop.path,
          foreignField: pop.foreignField || '_id',
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

const buildProjection = (model, select, populate) => {
  const projection = {};

  // 1. Add main model fields
  if (select) {
    select.split(' ').forEach((field) => {
      projection[field] = 1;
    });
  } else {
    // Dynamically include all fields from the model schema
    Object.keys(model.schema.paths).forEach((field) => {
      if (field !== '__v') projection[field] = 1;
    });
  }

  // 2. Add referenced model fields
  if (populate) {
    populate.forEach((pop) => {
      pop.select.split(' ').forEach((refField) => {
        projection[`${pop.path}.${refField}`] = 1;
      });
      delete projection[pop.path]; // Prevent collisions
    });
  }

  return projection;
};

const buildSort = (sort) => {
  if (!!sort && Object.keys(sort).length > 0) {
    return { $sort: sort };
  }
  return null;
};

const buildPagination = (skip, perPage) => [
  { $skip: skip },
  { $limit: perPage },
];

module.exports = dataFetcher;
