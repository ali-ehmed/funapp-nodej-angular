import { Types } from "mongoose";

export interface OrganizationResponse {
  id: Types.ObjectId;
  avatarUrl: string;
  name: string;
  totalRepositories: number;
}
