import mongoose, { Document, Model } from "mongoose";
import ModelConfigSchema from "../modelConfig/modelConfig";
import { ModelConfig, ReferenceConfig } from "../modelConfig/types";
import { CollectionName } from "../modelConfig/enums";
import { QueryParams, PopulateConfig, ColumnConfig, RowConfig } from "./types";

import dataFetcher from "../dataFetcher/dataFetcher";

// Main function: Orchestrates data fetching and transformation
const dataViewer = async (collectionName: string, params: QueryParams) => {
  // Check if the provided collectionName is valid
  if (!isValidCollectionName(collectionName)) {
    throw new Error(`Collection '${collectionName}' is not valid.`);
  }

  // Fetch model configuration
  const modelConfig = ModelConfigSchema[collectionName] as ModelConfig<Document>;
  if (!modelConfig) {
    throw new Error(`Collection '${collectionName}' not found.`);
  }

  const { search = "", filters = "{}", sort, sortOrder = "asc", page = 1, perPage = 10 } = params;
  const Model = modelConfig.model;

  // Build query and sorting
  const searchQuery = buildSearchQuery(Model, search);
  const parsedFilters = parseFilters(filters);
  const query = { ...parsedFilters, ...searchQuery };
  const sortQuery = buildSortQuery(sort, sortOrder, searchQuery);

  // Fetch paginated results
  const { results, totalRecords } = await dataFetcher({
    model: Model,
    filters: query,
    page,
    perPage,
    populate: getPopulates(modelConfig.references),
    fields: modelConfig.fields.join(" "),
    sort: sortQuery,
  });

  // Build columns and rows
  const columns = buildColumns(modelConfig);
  const rows = buildRows(results, modelConfig);

  return { columns, rows, totalRecords };
};

// Build Search Query
const buildSearchQuery = (Model: Model<Document>, search: string) => {
  if (!search) return {};

  const hasTextIndex = Model.schema.indexes().some((index) =>
    Object.values(index[0]).includes("text")
  );

  if (hasTextIndex) {
    return { $text: { $search: search } };
  }

  throw new Error("Search is not supported on this model.");
};

// Parse Filters
const parseFilters = (filters: string) => {
  const query: Record<string, any> = {};
  const parsedFilters = JSON.parse(filters);

  for (const [field, condition] of Object.entries(parsedFilters)) {
    if (field.includes(".")) {
      const [ref, refField] = field.split(".");
      query[`${ref}.${refField === "id" ? "_id" : refField}`] =
        refField === "id" && typeof condition === "string"? new mongoose.Types.ObjectId(condition) : condition;
    } else {
      query[field] = condition;
    }
  }
  return query;
};

// Build Sort Query
const buildSortQuery = (sortAttr: string | undefined, sortOrder: string, searchQuery: any) => {
  const sort: Record<string, any> = {};

  if (sortAttr) {
    sort[sortAttr] = sortOrder.toLowerCase() === "desc" ? -1 : 1;
  }

  if (searchQuery.$text) {
    sort.score = { $meta: "textScore" };
  }

  return sort;
};

// Build Dynamic Columns
const buildColumns = (modelConfig: ModelConfig<Document>): ColumnConfig[] => {
  const mainColumns: ColumnConfig[] = modelConfig.fields.map((field) => ({
    field: field === "_id" ? "id" : (field as string),
    headerName: capitalize(field === "_id" ? "id" : (field as string)),
  }));

  const referenceColumns: ColumnConfig[] = modelConfig.references.flatMap((ref) =>
    ref.fields.map((field) => ({
      field: `${ref.field}.${field === "_id" ? "id" : field}`,
      headerName: `${capitalize(ref.field as string)} ${capitalize(
        field === "_id" ? "id" : field
      )}`,
    }))
  );

  return mainColumns.concat(referenceColumns);
};

// Build Rows
const buildRows = (results: Document[], modelConfig: ModelConfig<Document>): RowConfig[] => {
  return results.map((item) => {
    const row: RowConfig = {};

    // Flatten main model fields
    modelConfig.fields.forEach((field) => {
      row[field === "_id" ? "id" : (field as string)] = item[field] || null;
    });

    modelConfig.references.forEach((ref) => {
      const refData = (item as Record<string, any>)[ref.field as string] || {};

      ref.fields.forEach((refField) => {
        row[`${ref.field}.${refField === "_id" ? "id" : refField}`] =
          refData[refField] || null;
      });
    });

    return row;
  });
};

// Get Populates
const getPopulates = (references: ReferenceConfig<Document>[]): PopulateConfig[] => {
  return references.map((ref) => ({
    path: ref.field as string,
    from: ref.collectionName,
    select: ref.fields.join(" "),
  }));
};

// Capitalize Helper
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);

// Helper: Validate collectionName
const isValidCollectionName = (name: string): name is CollectionName => {
  return Object.values(CollectionName).includes(name as CollectionName);
};

export default dataViewer;
