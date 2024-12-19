import jwt from "jsonwebtoken";
import User, { IUser } from "../models/userModel";
import { Document } from "mongoose";
import { GitHubProfile } from "./githubService/types";

// Function to find or upsert a user in the database
export const findOrUpsertUser = async (
  profile: GitHubProfile,
  accessToken: string
): Promise<IUser & Document> => {
  const user = await User.findOneAndUpdate(
    { githubId: profile.id }, // Find user by githubId
    {
      accessToken,
      avatarUrl: profile.avatar_url,
      connectedAt: new Date(), // Set connection time
      githubId: profile.id,
      name: profile.name,
      profileUrl: profile.html_url,
      username: profile.login,
    },
    {
      new: true, // Return the updated document
      upsert: true, // If no document matches, create a new one
      setDefaultsOnInsert: true, // Use default values for missing fields
    }
  );

  return user as IUser & Document;
};

// Function to generate a JWT token for the user
export const generateJwt = (user: IUser & Document): string => {
  return jwt.sign(
    { userId: user._id, username: user.username },
    process.env.JWT_SECRET as string, // Ensure JWT_SECRET is a string
    { expiresIn: "3h" }
  );
};
