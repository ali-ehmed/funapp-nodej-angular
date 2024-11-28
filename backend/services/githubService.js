const axios = require('axios');

const redirectUri = 'http://localhost:3000/auth/github/callback';
const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${redirectUri}&scope=read:org,repo&login&prompt=consent`;

const exchangeCodeForToken = async (code) => {
  try {
    const { data } = await axios.post('https://github.com/login/oauth/access_token', null, {
      params: {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
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

// Fetch organizations for the authenticated user
const fetchOrganizationsData = async (accessToken) => {
  try {
    const response = await axios.get('https://api.github.com/user/orgs', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data; // Return the list of organizations
  } catch (error) {
    throw new Error('Failed to fetch organizations from GitHub');
  }
};

// Fetch repositories for a given organization
const fetchRepositoriesData = async (orgLogin, accessToken) => {
  try {
    const response = await axios.get(`https://api.github.com/orgs/${orgLogin}/repos`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data; // Return the list of repositories
  } catch (error) {
    throw new Error('Failed to fetch repositories from GitHub');
  }
};

module.exports = {
  githubAuthUrl,
  exchangeCodeForToken,
  fetchGitHubUserData,
  fetchOrganizationsData,
  fetchRepositoriesData
};
