const { Octokit } = require("@octokit/rest");

class GithubService {
  constructor(accessToken) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  // Static method to get user details
  async getAuthenticatedUser() {
    return this.octokit.users.getAuthenticated();
  }

  async getUserOrganizations() {
    try {
      return await this.octokit.paginate(this.octokit.rest.orgs.listForAuthenticatedUser);
    } catch (error) {
      console.log(error);
      throw new GithubService('Failed to fetch organizations from GitHub', error.status);
    }
  };

  async getOrgRepositories(orgLogin) {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listForOrg, {
        org: orgLogin,
      });
    } catch (error) {
      console.log(error);
      throw new GithubService('Failed to fetch organizations from GitHub', error.status);
    }
  };
}

module.exports = GithubService;
