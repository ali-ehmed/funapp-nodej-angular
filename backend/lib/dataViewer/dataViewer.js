const mongoose = require('mongoose');

const ModelConfigSchema = require('./modelConfigSchema');
const dataFetcher = require('../dataFetcher');

// Main function: orchestrates data fetching and transformation
const dataViewer = async (collectionName, params) => {
  // Fetch model configuration
  const modelConfig = ModelConfigSchema[collectionName];
  if (!modelConfig) {
    throw new Error(`Collection '${collectionName}' not found.`);
  }

  const {
    search = '',
    filters = '{}',
    sort: sortAttr,
    sortOrder = 'asc',
    page,
    perPage: pageSize
  } = params;

  const Model = modelConfig.model;

  // Build query and sorting
  const searchQuery = buildSearchQuery(Model, search);
  const parsedFilters = parseFilters(filters);
  const query = { ...parsedFilters, ...searchQuery };
  const sort = buildSortQuery(sortAttr, sortOrder, searchQuery);

  // Fetch paginated results
  const { results, totalRecords } = await dataFetcher({
    model: Model,
    filters: query,
    page,
    perPage: pageSize,
    populate: getPopulates(modelConfig),
    fields: modelConfig.fields,
    sort,
  });

  // Build columns and rows
  const columns = buildColumns(modelConfig);
  const rows = buildRows(results, modelConfig);

  return { columns, rows, totalRecords };
};

// 1. Handle Text Search
const buildSearchQuery = (Model, search) => {
  if (!search) return {};

  const hasTextIndex = Model.schema.indexes().some(index =>
    Object.values(index[0]).includes('text')
  );

  if (hasTextIndex) {
    return { $text: { $search: search } };
  }

  throw new Error('Search is not supported on this model.');
};

// 2. Parse Filters
const parseFilters = (filters) => {
  const query = {};
  const parsedFilters = JSON.parse(filters);

  for (const [field, condition] of Object.entries(parsedFilters)) {
    if (field.includes('.')) {
      const [ref, refField] = field.split('.');
      query[`${ref}.${refField === 'id' ? '_id' : refField}`] =
        refField === 'id' ? new mongoose.Types.ObjectId(condition) : condition;
    } else {
      query[field] = condition;
    }
  }
  return query;
};

// 3. Build Sort Query
const buildSortQuery = (sortAttr, sortOrder, searchQuery) => {
  const sort = {};

  if (sortAttr) {
    sort[sortAttr] = sortOrder.toLowerCase() === 'desc' ? -1 : 1;
  }

  if (searchQuery.$text) {
    sort.score = { $meta: 'textScore' }; // Prioritize text score when search is applied
  }

  return sort;
};

// 4. Build Dynamic Columns
const buildColumns = (modelConfig) => {
  const mainColumns = modelConfig.fields.split(' ').map(field => ({
    field: field === '_id' ? 'id' : field,
    headerName: capitalize(field === '_id' ? 'id' : field),
  }));

  const referenceColumns = modelConfig.references.reduce((acc, ref) => {
    const refFields = ref.fields.split(' ').map(field => ({
      field: `${ref.field}.${field === '_id' ? 'id' : field}`,
      headerName: `${capitalize(ref.field)} ${capitalize(field === '_id' ? 'id' : field)}`,
    }));
    return acc.concat(refFields);
  }, []);

  return mainColumns.concat(referenceColumns);
};

// 5. Build Rows
const buildRows = (results, modelConfig) => {
  return results.map(item => {
    const row = {};

    // Flatten main model fields
    modelConfig.fields.split(' ').forEach(field => {
      row[field === '_id' ? 'id' : field] = item[field] || null;
    });

    // Flatten referenced fields
    modelConfig.references.forEach(ref => {
      const refData = item[ref.field] || {};
      ref.fields.split(' ').forEach(refField => {
        row[`${ref.field}.${refField === '_id' ? 'id' : refField}`] = refData[refField] || null;
      });
    });

    return row;
  });
};

// Helper: Get Populates
const getPopulates = (modelConfig) => {
  return modelConfig.references.map(ref => ({
    path: ref.field,
    from: ref.collectionName,
    select: ref.fields,
  }));
};

// Helper: Capitalize String
const capitalize = str => str.charAt(0).toUpperCase() + str.slice(1);

module.exports = dataViewer;
