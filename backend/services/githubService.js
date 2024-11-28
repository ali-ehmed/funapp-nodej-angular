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

// Fetch collaborators for a repository
const fetchRepoCollaborators = async (repoFullname, accessToken) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoFullname}/collaborators`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data; // This will give you the list of collaborators with access to the repo
  } catch (error) {
    console.error('Failed to fetch repository collaborators:', error);
    throw new Error('Failed to fetch repository collaborators');
  }
};

// Fetch user info by account id
const fetchUserInfo = async (accountId) => {
  try {
    const response = await axios.get(`https://api.github.com/user/${accountId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user info:', error);
    throw new Error('Failed to fetch user info');
  }
};

// Fetch all branches in a repository
const fetchRepositoryBranches = async (repoFullName, accessToken) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoFullName}/branches`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data; // List of branches
  } catch (error) {
    console.error('Failed to fetch branches:', error);
    throw new Error('Failed to fetch branches');
  }
};

// Fetch commits for a specific collaborator across all branches
const fetchRepoCollaboratorCommits = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    // Step 1: Get the list of branches in the repository
    const branches = await fetchRepositoryBranches(repoFullName, accessToken);

    // Step 2: Fetch commits for each branch for the given collaborator
    let allCommits = [];

    for (let branch of branches) {
      const response = await axios.get(`https://api.github.com/repos/${repoFullName}/commits`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          author: collaboratorLogin, // Filter by collaborator login
          sha: branch.name, // Fetch commits for this specific branch
        },
      });

      allCommits = allCommits.concat(response.data); // Combine commits from each branch
    }

    return allCommits; // Return the combined commits from all branches
  } catch (error) {
    console.error('Failed to fetch commits for collaborator:', error);
    throw new Error('Failed to fetch commits');
  }
};

// Fetch pull requests created by a specific collaborator in a repository
const fetchRepoCollaboratorPRs = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoFullName}/pulls`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    // Filter pull requests by collaborator (author)
    const pullRequestsByAuthor = response.data.filter(pr => pr.user.login === collaboratorLogin);

    return pullRequestsByAuthor; // Return the filtered pull requests
  } catch (error) {
    throw new Error('Failed to fetch pull requests');
  }
};

// Fetch issues assigned to a specific collaborator in a repository
const fetchRepoAssignedIssues = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    const response = await axios.get(`https://api.github.com/repos/${repoFullName}/issues`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        assignee: collaboratorLogin, // Filter by collaborator login
      }
    });

    return response.data; // Return the list of issues
  } catch (error) {
    console.error('Failed to fetch issues for collaborator:', error);
    throw new Error('Failed to fetch issues');
  }
};

module.exports = {
  githubAuthUrl,
  exchangeCodeForToken,
  fetchGitHubUserData,
  fetchOrganizationsData,
  fetchRepositoriesData,
  fetchRepoCollaborators,
  fetchUserInfo,
  fetchRepoCollaboratorPRs,
  fetchRepoCollaboratorCommits,
  fetchRepoAssignedIssues
};
