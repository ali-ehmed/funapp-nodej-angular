import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";

// Middleware to verify JWT token
const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies?.authToken;

  if (!token) {
    res.status(401).json({
      message: "No token provided",
    }); // Unauthorized if no token
    return
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    if (!decoded || !decoded.userId) {
      res.status(403).json({
        message: "Token is not valid",
      });
      return
    }

    // Find the user by decoded userId
    const foundUser = await User.findById(decoded.userId);
    if (!foundUser) {
      res.status(401).json({
        message: "Unauthorized",
      });
      return
    }

    next();
  } catch (err) {
    res.status(403).json({
      message: "Token is not valid",
    }); // Forbidden if token is invalid
    return
  }
};

export default authenticateUser;
