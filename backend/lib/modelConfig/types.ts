import { Model, Document } from "mongoose";
import { CollectionName } from "./enums";

// Reference Config Type
export interface ReferenceConfig<T extends Document> {
  collectionName: CollectionName;
  field: keyof T; // Reference field in the main model
  fields: (string | keyof T)[]; // Fields of the referenced model
  filterFields?: (string | keyof T)[];
}

// Model Config Type
export interface ModelConfig<T extends Document> {
  collectionName: CollectionName;
  model: Model<T>;
  fields: (keyof T)[]; // Top-level fields restricted to model type
  references: ReferenceConfig<T>[];
  filterFields?: (keyof T)[]; // Optional: Fields to filter on
}
