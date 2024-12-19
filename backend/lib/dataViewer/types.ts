import { Document } from "mongoose";
import { CollectionName } from "../modelConfig/enums";

// Interface for Query Parameters
export interface QueryParams {
  search?: string;
  filters?: string; // JSON string of filters
  sort?: string; // Sort attribute
  sortOrder?: string; // 'asc' or 'desc'
  page?: number;
  perPage?: number;
}

// Interface for Paginated Results
export interface PaginatedResults {
  results: Document[];
  totalRecords: number;
}

// Interface for Column Definition
export interface ColumnConfig {
  field: string;
  headerName: string;
}

// Interface for Row Definition
export type RowConfig = Record<string, any>;

// Interface for Populates
export interface PopulateConfig {
  path: string;
  from: CollectionName;
  select: string;
}
