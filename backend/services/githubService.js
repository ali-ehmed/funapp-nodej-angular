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
  const url = 'https://api.github.com/user/orgs';

  try {
    return await fetchPaginatedData(url, accessToken);
  } catch (error) {
    console.error('Failed to fetch organizations from GitHub', error);
    throw new Error('Failed to fetch organizations from GitHub');
  }
};

// Fetch repositories data for a given organization (with pagination)
const fetchRepositoriesData = async (orgLogin, accessToken) => {
  const url = `https://api.github.com/orgs/${orgLogin}/repos`;

  try {
    return await fetchPaginatedData(url, accessToken);
  } catch (error) {
    console.error(`Failed to fetch repositories from GitHub for organization: ${orgLogin}`, error);
    throw new Error(`Failed to fetch repositories from GitHub for organization: ${orgLogin}`);
  }
};

// Fetch collaborators for a repository (with pagination)
const fetchRepoCollaborators = async (repoFullName, accessToken) => {
  const url = `https://api.github.com/repos/${repoFullName}/collaborators`;

  try {
    return await fetchPaginatedData(url, accessToken);
  } catch (error) {
    console.error(`Failed to fetch repository collaborators for repository: ${repoFullName}`, error);
    throw new Error(`Failed to fetch repository collaborators for repository: ${repoFullName}`);
  }
};

// Fetch user info by account id
const fetchUserInfo = async (accountId) => {
  try {
    const response = await axios.get(`https://api.github.com/user/${accountId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user info for accountId: ${accountId}`, error);
    throw new Error(`Failed to fetch user info for accountId: ${accountId}`);
  }
};

// Fetch all branches in a repository (with pagination)
const fetchRepositoryBranches = async (repoFullName, accessToken) => {
  const url = `https://api.github.com/repos/${repoFullName}/branches`;

  try {
    return await fetchPaginatedData(url, accessToken);
  } catch (error) {
    console.error(`Failed to fetch branches for repository: ${repoFullName}`, error);
    throw new Error(`Failed to fetch branches for repository: ${repoFullName}`);
  }
};

// Fetch commits for a specific collaborator across all branches (with pagination)
const fetchRepoCollaboratorCommits = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    // Get the list of branches in the repository
    const branches = await fetchRepositoryBranches(repoFullName, accessToken);

    // Fetch commits for each branch for the given collaborator
    let allCommits = [];

    for (let branch of branches) {
      const url = `https://api.github.com/repos/${repoFullName}/commits`;
      const commitsData =  await fetchPaginatedData(
        url,
        accessToken,
        {
          author: collaboratorLogin, // Filter by collaborator login
          sha: branch.name, // Fetch commits for this specific branch
        }
      );

      allCommits = allCommits.concat(commitsData); // Combine commits from each branch
    }

    return allCommits;
  } catch (error) {
    console.error(`Failed to fetch commits for collaborator: ${collaboratorLogin} for repository: ${repoFullName}`, error);
    throw new Error(`Failed to fetch commits for collaborator: ${collaboratorLogin} for repository: ${repoFullName}`);
  }
};

// Fetch pull requests created by a specific collaborator in a repository
const fetchRepoCollaboratorPRs = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/pulls`;
    const pullRequestsData = await fetchPaginatedData(url, accessToken);

    // Filter pull requests by collaborator (author)
    const pullRequestsByAuthor = pullRequestsData.filter(pr => pr.user.login === collaboratorLogin);

    return pullRequestsByAuthor; // Return the filtered pull requests
  } catch (error) {
    console.error(`Failed to fetch pull request for repository: ${repoFullName} and assigned to ${collaboratorLogin}`, error);
    throw new Error(`Failed to fetch pull request for repository: ${repoFullName} and assigned to ${collaboratorLogin}`);
  }
};

// Fetch issues assigned to a specific collaborator in a repository
const fetchRepoAssignedIssues = async (repoFullName, accessToken, collaboratorLogin) => {
  try {
    const url = `https://api.github.com/repos/${repoFullName}/issues`;
    return await fetchPaginatedData(
      url,
      accessToken,
      {
        assignee: collaboratorLogin, // Filter by collaborator login
      }
    );
  } catch (error) {
    console.error(`Failed to fetch issues for repository: ${repoFullName} asssigned to collaborator: ${collaboratorLogin}`, error);
    throw new Error(`Failed to fetch issues for repository: ${repoFullName} asssigned to collaborator: ${collaboratorLogin}` );
  }
};

// Fetch data through pagination
const fetchPaginatedData = async (url, accessToken, params = {}) => {
  const allData = []; // To store all the results
  let page = 1;
  const perPage = 100; // Number of results per page (can be adjusted if needed)

  try {
    while (true) {
      // Fetch data for the current page
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params: {
          ...params,   // Add any additional params (e.g., filters)
          page: page,  // The current page
          per_page: perPage,  // Number of results per page
        },
      });

      // If no data is returned, stop the loop
      if (response.data.length === 0) {
        break;
      }

      // Add the current page's data to the result array
      allData.push(...response.data);

      // Move to the next page
      page++;
    }

    return allData; // Return all the fetched data
  } catch (error) {
    throw new Error(`Failed to fetch data from ${url}: ${error.message}`);
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
