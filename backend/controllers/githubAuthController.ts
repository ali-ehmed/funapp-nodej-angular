import { Request, Response } from "express";
import { oauthApp } from "../config/oauthApp";
import { GithubService } from "../services/githubService/githubService";
import * as AuthService from "../services/authService";
import { GitHubAuthCallbackRequest } from "./types/githubAuthControllerTypes";
import { GitHubProfile } from "../services/githubService/types";

// GitHub OAuth2: Start the authentication flow
export const githubAuth = (_: Request, res: Response): void => {
  const state = Math.random().toString(36).substring(2); // Generate a random state
  const options = { state, prompt: "consent" };
  const { url } = oauthApp.getWebFlowAuthorizationUrl(options);

  res.redirect(url);
};

// GitHub OAuth2: Callback handler after GitHub has authenticated the user
export const githubCallback = async (
  req: GitHubAuthCallbackRequest,
  res: Response
): Promise<void> => {
  const { code, state } = req.query;

  // TODO: Implement state verification for security
  try {
    // Step 1: Exchange the code for an access token
    const { authentication } = await oauthApp.createToken({
      state,
      code,
    });
    const { token: accessToken } = authentication;

    // Step 2: Fetch GitHub user data
    const githubService = new GithubService(accessToken);
    const userData = await githubService.getAuthenticatedUser();

    const profile: GitHubProfile = {
      id: userData.id.toString(),
      avatar_url: userData.avatar_url,
      name: userData.name || "",
      html_url: userData.html_url,
      login: userData.login,
    };

    // Step 3: Find or upsert user in the database
    const user = await AuthService.findOrUpsertUser(profile, accessToken);

    // Step 4: Generate JWT
    const jwtToken = AuthService.generateJwt(user);

    // Step 5: Set JWT as HTTP-only cookie
    res.cookie("authToken", jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3 * 60 * 60 * 1000, // 3 hours in milliseconds
    });

    // Step 6: Redirect to the frontend URL
    res.redirect(process.env.FRONTEND_URL as string);
  } catch (error) {
    console.error("Error during GitHub OAuth callback:", error);
    res.redirect(`${process.env.FRONTEND_URL as string}/error`);
  }
};
