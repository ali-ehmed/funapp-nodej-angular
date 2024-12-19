import { IUser } from "../../../models/userModel";
import { AuthenticatedRequest } from "./authenticateUserTypes";

interface PaginationParams {
  page: number;
  perPage: number;
}

export interface ListApiRequest extends AuthenticatedRequest {
  user: IUser; // Authenticated user information
  pagination: PaginationParams; // Pagination parameters
}
