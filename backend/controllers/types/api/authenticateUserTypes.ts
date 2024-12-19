import { Request } from "express";
import { Document } from "mongoose";
import { IUser } from "../../../models/userModel";

// Extended Request for Authenticated User
export interface AuthenticatedRequest extends Request {
  user: IUser & Document;
}
