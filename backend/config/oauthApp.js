const { OAuthApp } = require('@octokit/oauth-app');
const GithubService = require("../services/githubService");

exports.oauthApp = new OAuthApp({
  clientType: "oauth-app",
  clientId: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  defaultScopes: ["read:org,repo"],
  redirectUrl: GithubService.redirectUri,
});
