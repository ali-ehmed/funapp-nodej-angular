const GithubService = require('../services/githubService');
const AuthService = require('../services/authService');

// GitHub OAuth2: Start the authentication flow
exports.githubAuth = (req, res) => {
  const redirectUri = process.env.GITHUB_REDIRECT_URI;
  const clientId = process.env.GITHUB_CLIENT_ID;
  
  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=user&prompt=login`;
  
  res.redirect(githubAuthUrl);
}

// GitHub OAuth2: Callback handler after GitHub has authenticated the user
exports.githubCallback = async (req, res) => {
  const { code } = req.query;
  
  try {
    // Step 1: Exchange the code for an access token
    const accessToken = await GithubService.exchangeCodeForToken(code);

    // Step 2: Fetch GitHub user data
    const profile = await GithubService.fetchGitHubUserData(accessToken);

    // Step 3: Find or upsert user in the database
    const user = await AuthService.findOrUpsertUser(profile);

    // Step 4: Generate JWT
    const token = AuthService.generateJwt(user);

    // Step 5: Set JWT as HTTP-only cookie
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000, // 1 hour
    });

    // Redirect to frontend
    res.redirect(process.env.FRONTEND_URL);
  } catch (error) {
    console.error('Error during callback:', error);
    res.redirect(process.env.FRONTEND_URL + '/error');
  }
};
