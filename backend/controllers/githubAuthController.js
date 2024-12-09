const GithubService = require("../services/githubService");
const AuthService = require("../services/authService");
const { oauthApp } = require("../config/oauthApp");

// GitHub OAuth2: Start the authentication flow
exports.githubAuth = (_, res) => {
  const state = Math.random().toString(36).substring(2);
  const { url } = oauthApp.getWebFlowAuthorizationUrl({
    state,
    prompt: "consent",
  });

  res.redirect(url)
};

// GitHub OAuth2: Callback handler after GitHub has authenticated the user
exports.githubCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    // Step 1: Exchange the code for an access token
    const { authentication } = await oauthApp.createToken({
      state,
      code,
    });
    const { token: accessToken } = authentication;

    // Step 2: Fetch GitHub user data
    const github = new GithubService(accessToken);
    const { data: profile } = await github.getAuthenticatedUser();

    // Step 3: Find or upsert user in the database
    const user = await AuthService.findOrUpsertUser(profile, accessToken);

    // Step 4: Generate JWT
    const token = AuthService.generateJwt(user);

    // Step 5: Set JWT as HTTP-only cookie
    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 3600000, // 1 hour
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error("Error during callback:", error);
    res.redirect(process.env.FRONTEND_URL + "/error");
  }
};
