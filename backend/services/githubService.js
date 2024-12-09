const { Octokit } = require("@octokit/rest");
const GithubServiceError = require('../lib/githubServiceError');

class GithubService {
  constructor(accessToken) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  // Fetch the authenticated user's data
  async getAuthenticatedUser() {
    try {
      return this.octokit.users.getAuthenticated();
    } catch (error) {
      throw new GithubServiceError('Failed to fetch user data from GitHub', error.status);
    }
  }

  // Fetch paginated organizations for the authenticated user
  async getUserOrganizations() {
    try {
      return await this.octokit.paginate(this.octokit.rest.orgs.listForAuthenticatedUser);
    } catch (error) {
      console.log(error);
      throw new GithubServiceError('Failed to fetch organizations from GitHub', error.status);
    }
  };

  // Fetch repositories paginated data for a given organization
  async getOrgRepositories(org) {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listForOrg, {
        org,
      });
    } catch (error) {
      throw new GithubServiceError('Failed to fetch org repositories from GitHub', error.status);
    }
  };

  // Fetch paginated collaborators for a repository
  async getRepoCollaborators(org, repo) {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listCollaborators, {
        owner: org,
        repo,
      });
    } catch (error) {
      throw new GithubServiceError('Failed to fetch repo collaborators from GitHub', error.status);
    }
  };

  // Fetch user info by username
  async getUserInfo(username) {
    try {
      return await this.octokit.rest.users.getByUsername({
        username,
      });
    } catch (error) {
      throw new GithubServiceError('Failed to fetch user info from GitHub', error.status);
    }
  };

  // Fetch all paginated branches in a repository
  async getRepoBranches(org, repo) {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listBranches, {
        owner: org,
        repo,
      });
    } catch (error) {
      throw new GithubServiceError('Failed to fetch repo branches from GitHub', error.status);
    }
  };

  // Fetch all commits for a given collaborator in a repository
  async getRepoCollaboratorAllCommits(org, repo, collaboratorLogin) {
    try {
      // Get the list of branches in the repository
      const branches = await this.getRepoBranches(org, repo);

      // Fetch commits for each branch for the given collaborator
      let allCommits = [];

      for (let branch of branches) {
        const commitsData = await this.octokit.paginate(this.octokit.rest.repos.listCommits, {
          owner: org,
          repo,
          sha: branch.name,
          author: collaboratorLogin
        });

        allCommits = allCommits.concat(commitsData); // Combine commits from each branch
      }

      return allCommits;
    } catch (error) {
      throw new GithubServiceError(`Failed to fetch repo commits for ${collaboratorLogin} from GitHub`, error.status);
    }
  };

  // Fetch all pull requests for a given collaborator in a repository
  async getRepoCollaboratorPRs(org, repo, collaboratorLogin) {
    try {
      const pullRequestsData = await this.octokit.paginate(this.octokit.rest.pulls.list, {
        owner: org,
        repo,
      });

      // Filter pull requests by collaborator (author)
      const pullRequestsByAuthor = pullRequestsData.filter(pr => pr.user.login === collaboratorLogin);
      return pullRequestsByAuthor;
    } catch (error) {
      throw new GithubServiceError(`Failed to fetch repo pulls for ${collaboratorLogin} from GitHub`, error.status);
    }
  };

  // Fetch all issues assigned to a given collaborator in a repository
  async getRepoCollaboratorAssignedIssues(org, repo, collaboratorLogin) {
    try {
      return await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
        owner: org,
        repo,
        assignee: collaboratorLogin,
      });
    } catch (error) {
      throw new GithubServiceError(`Failed to fetch repo issues assigned to ${collaboratorLogin} from GitHub`, error.status);
    }
  };
}

module.exports = GithubService;
