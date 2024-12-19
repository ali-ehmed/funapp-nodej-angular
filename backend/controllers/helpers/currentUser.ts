import { Request } from "express";

import jwt, { JwtPayload } from "jsonwebtoken";
import User, { IUser } from "../../models/userModel";

export const currentUser = async (req: Request): Promise<IUser> => {
  const decoded = jwt.verify(req.cookies.authToken, process.env.JWT_SECRET as string) as JwtPayload;

  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
