import { Request, Response } from "express";
import { AuthenticatedRequest } from "./authenticateUserTypes";

// Request Body for Sync Repositories Data
export interface SyncRepositoriesDataRequest extends AuthenticatedRequest {
  params: {
    org_id: string;
  };
  body: {
    include_repository_ids: string[];
    exclude_repository_ids: string[];
  };
}

// Response Type
export type GithubSyncResponse = Response;
