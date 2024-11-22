const axios = require('axios');

const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user&prompt=login`;

const exchangeCodeForToken = async (code) => {
  try {
    const { data } = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      },
      headers: {
        'Accept': 'application/json',
      },
    });
    return data.access_token;
  } catch (error) {
    throw new Error('Failed to exchange code for token');
  }
};

const fetchGitHubUserData = async (accessToken) => {
  try {
    const { data } = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const { id, login, name, avatar_url, html_url } = data;
    return {
      id,
      username: login,
      name,
      avatarUrl: avatar_url,
      profileUrl: html_url,
    };
  } catch (error) {
    throw new Error('Failed to fetch user data from GitHub');
  }
};

module.exports = { githubAuthUrl, exchangeCodeForToken, fetchGitHubUserData };
