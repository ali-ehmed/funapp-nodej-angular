import mongoose, { Document, Model } from "mongoose";
import ModelConfigSchema from "../modelConfig/modelConfig";
import { ModelConfig, ReferenceConfig } from "../modelConfig/types";
import { CollectionName } from "../modelConfig/enums";
import { QueryParams, PopulateConfig, ColumnConfig, RowConfig } from "./types";

import dataFetcher from "../dataFetcher/dataFetcher";

const REFERENCE_FIELD_SEPARATOR = "-";

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
  const parsedFilters = parseFilters(Model, filters);
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
const parseFilters = (Model: Model<Document>, filters: string) => {
  const query: Record<string, any> = {};
  const parsedFilters = JSON.parse(filters);

  // Get schema paths from the model
  const schemaPaths = Model.schema.paths;

  for (const [field, condition] of Object.entries(parsedFilters)) {
    if (field.includes(REFERENCE_FIELD_SEPARATOR)) {
      const [ref, refField] = field.split(REFERENCE_FIELD_SEPARATOR);
      query[`${ref}.${refField === "id" ? "_id" : refField}`] =
        refField === "id" && typeof condition === "string"
          ? new mongoose.Types.ObjectId(condition)
          : condition;
    } else {
      // Check the field type in the schema
      const fieldType = schemaPaths[field]?.instance;

      if (fieldType === "Date") {
        // Convert conditions to Date objects
        if (typeof condition === "object" && condition !== null) {
          query[field] = {};
          for (const [operator, value] of Object.entries(condition)) {
            query[field][operator] = new Date(value as string);
          }
        } else if (typeof condition === "string") {
          query[field] = new Date(condition);
        } else {
          query[field] = condition; // Handle non-date conditions
        }
      } else {
        query[field === "id" ? "_id" : field] = condition; // Non-date fields remain unchanged
      }
    }
  }

  return query;
};

// Build Sort Query
const buildSortQuery = (sortAttr: string | undefined, sortOrder: string, searchQuery: any) => {
  const sort: Record<string, any> = {};

  if (sortAttr) {
    // Check if the sortAttr contains REFERENCE_FIELD_SEPARATOR
    if (sortAttr.includes(REFERENCE_FIELD_SEPARATOR)) {
      const [ref, refField] = sortAttr.split(REFERENCE_FIELD_SEPARATOR);
      if (refField === "id") {
        sort[`${ref}._id`] = sortOrder.toLowerCase() === "desc" ? -1 : 1;
      } else {
        sort[`${ref}.${refField}`] = sortOrder.toLowerCase() === "desc" ? -1 : 1;
      }
    } else {
      // If no REFERENCE_FIELD_SEPARATOR, use the field as is
      sort[sortAttr === "id" ? "_id" : sortAttr] = sortOrder.toLowerCase() === "desc" ? -1 : 1;
    }
  }

  if (searchQuery.$text) {
    sort.score = { $meta: "textScore" };
  }

  return sort;
};

// Build Dynamic Columns
const buildColumns = (modelConfig: ModelConfig<Document>): ColumnConfig[] => {
  const { model, fields, filterFields = [], references } = modelConfig;
  // Extract field types from Mongoose schema
  const schemaPaths = model.schema.paths;

  const mainColumns: ColumnConfig[] = fields.map((field) => {
    const type = schemaPaths[field]?.instance || "string";

    return {
      headerName: capitalize(field === "_id" ? "id" : (field as string)),
      field: field === "_id" ? "id" : (field as string),
      ...(filterFields.includes(field) ? { type: mapMongooseTypeToFrontendType(type) } : {}),
    }
  });

  const referenceColumns: ColumnConfig[] = references.flatMap((ref) => {
    const {
      field: refField,
      fields: refCollectionFields,
      filterFields: refFilterFields = [],
    } = ref;

    return refCollectionFields.map((refCollectionFieldName) => {
      // We'd like to construct a field name like "repository-name" or "author-id"
      const constructFieldName = refField +
        REFERENCE_FIELD_SEPARATOR +
        (refCollectionFieldName === "_id" ? "id" : refCollectionFieldName);

      const type = schemaPaths[refField]?.instance || "string";
      return {
        headerName: `${capitalize(refField as string)} ${capitalize(
          refCollectionFieldName === "_id" ? "id" : refCollectionFieldName
        )}`,
        field: constructFieldName,
        ...(refFilterFields.includes(refCollectionFieldName) ? { type: mapMongooseTypeToFrontendType(type) } : {}),
      }

      // In future, we can add extra logic to handle reference fields
      // This is commented out because the frontend ag-grid table free version does not support reference fields
      //
      // return {
      //   headerName: `${capitalize(refField as string)} ${capitalize(
      //     refCollectionFieldName === "_id" ? "id" : refCollectionFieldName
      //   )}`,
      //   field: constructFieldName,
      //   ...(
      //     refFilterFields.includes(refCollectionFieldName)
      //     ?
      //       {
      //         type: 'reference',
      //         referenceCollection: ref.collectionName,
      //         referenceKey: refField,
      //       }
      //     :
      //       {}
      //   ),
      // }
    })
  });

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
        row[`${ref.field}-${refField === "_id" ? "id" : refField}`] =
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

// Helper: Validate collectionName
export const isValidCollectionName = (name: string): name is CollectionName => {
  return Object.values(CollectionName).includes(name as CollectionName);
};

// Capitalize Helper
const capitalize = (str: string): string => str.charAt(0).toUpperCase() + str.slice(1);


const mapMongooseTypeToFrontendType = (mongooseType: string): string => {
  switch (mongooseType) {
    case "String":
      return "text";
    case "Number":
      return "number";
    case "Date":
      return "date";
    case "Boolean":
      return "boolean";
    default:
      return "text"; // Default to text for unknown types
  }
}

export default dataViewer;
