import { OAuthApp } from "@octokit/oauth-app";

// Validate that environment variables exist
const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  throw new Error("GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET must be defined in the environment variables.");
}

// Export the OAuth app instance
export const oauthApp = new OAuthApp({
  clientType: "oauth-app",
  clientId,
  clientSecret,
  defaultScopes: ["read:org", "repo"],
});
