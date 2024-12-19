import { Model, FilterQuery, SortOrder } from "mongoose";

// Type for Populate Options
export interface PopulateOption {
  path: string;
  from: string;
  localField?: string;
  foreignField?: string;
  select: string;
}

// Type for DataFetcher Parameters
export interface DataFetcherParams<T> {
  model: Model<T>;
  filters?: FilterQuery<T>; // Use Mongoose's FilterQuery for filters
  page?: number;
  perPage?: number;
  populate?: PopulateOption[] | null;
  fields?: string | null;
  sort?: Record<string, SortOrder> | null; // Sort with stricter typing
}

// Type for DataFetcher Return Value
export interface DataFetcherResult<T> {
  results: T[];
  totalRecords: number;
}
