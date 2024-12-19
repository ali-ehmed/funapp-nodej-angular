import { Request, Response } from "express";

import { currentUser } from "../helpers";

// Check authentication status
export const checkAuthStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await currentUser(req);
    
    // Respond with user data
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error during checkAuthStatus:", err);
    res.status(500).json({ message: "Error checking authentication status" });
  }
};

// Logout the user
export const logout = async (_: Request, res: Response): Promise<void> => {
  try {
    // Clear the JWT cookie
    res.clearCookie("authToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // Respond with a 200 OK status
    res.status(200).send();
  } catch (err) {
    console.error("Error during logout:", err);
    res.status(500).json({ message: "Error during logout" });
  }
};
