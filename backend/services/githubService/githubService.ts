import { Octokit } from "@octokit/rest";
import GithubServiceError from "../../lib/githubServiceError";
import {
  UserAuthenticatedResponse,
  OrganizationResponse,
  RepositoryResponse,
  CollaboratorsResponse,
  UserInfoResponse,
  BranchesResponse,
  CommitsResponse,
  PullRequestsResponse,
  IssuesResponse,
} from "./types";

export class GithubService {
  private octokit: Octokit;

  constructor(accessToken: string) {
    this.octokit = new Octokit({ auth: accessToken });
  }

  // Fetch the authenticated user's data
  async getAuthenticatedUser(): Promise<UserAuthenticatedResponse> {
    try {
      const response = await this.octokit.rest.users.getAuthenticated();
      return response.data;
    } catch (error: any) {
      throw new GithubServiceError(
        "Failed to fetch user data from GitHub.",
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch paginated organizations for the authenticated user
  async getUserOrganizations(): Promise<OrganizationResponse> {
    try {
      return await this.octokit.paginate(this.octokit.rest.orgs.listForAuthenticatedUser);
    } catch (error: any) {
      throw new GithubServiceError(
        "Failed to fetch organizations from GitHub.",
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch repositories paginated data for a given organization
  async getOrgRepositories(org: string): Promise<RepositoryResponse> {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listForOrg, {
        org,
      });
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch org repositories for ${org} from GitHub.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch paginated collaborators for a repository
  async getRepoCollaborators(org: string, repo: string): Promise<CollaboratorsResponse> {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listCollaborators, {
        owner: org,
        repo,
      });
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch repo collaborators for ${org}/${repo} from GitHub.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch user info by username
  async getUserInfo(username: string): Promise<UserInfoResponse> {
    try {
      const response = await this.octokit.rest.users.getByUsername({ username });
      return response.data;
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch user info for user ${username} from GitHub.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch all branches for a repository
  async getRepoBranches(org: string, repo: string): Promise<BranchesResponse> {
    try {
      return await this.octokit.paginate(this.octokit.rest.repos.listBranches, {
        owner: org,
        repo,
      });
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch repo branches for ${org}/${repo}.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch all commits for a collaborator in a repository
  async getRepoCollaboratorAllCommits(
    org: string,
    repo: string,
    collaboratorLogin: string
  ): Promise<CommitsResponse> {
    try {
      const branches = await this.getRepoBranches(org, repo);

      let allCommits: CommitsResponse = [];
      for (const branch of branches) {
        const commits = await this.octokit.paginate(
          this.octokit.rest.repos.listCommits,
          { owner: org, repo, sha: branch.name, author: collaboratorLogin }
        );
        allCommits = allCommits.concat(commits);
      }

      return allCommits;
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch repo commits for ${collaboratorLogin} from ${org}/${repo}.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch pull requests for a collaborator
  async getRepoCollaboratorPRs(
    org: string,
    repo: string,
    collaboratorLogin: string
  ): Promise<PullRequestsResponse> {
    try {
      const pullRequests = await this.octokit.paginate(
        this.octokit.rest.pulls.list,
        { owner: org, repo }
      );
      return pullRequests.filter((pr) => pr.user?.login === collaboratorLogin);
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch repo PRs for ${collaboratorLogin} from ${org}/${repo}.`,
        error.status,
        error.response?.data
      );
    }
  }

  // Fetch issues assigned to a collaborator
  async getRepoCollaboratorAssignedIssues(
    org: string,
    repo: string,
    collaboratorLogin: string
  ): Promise<IssuesResponse> {
    try {
      return await this.octokit.paginate(this.octokit.rest.issues.listForRepo, {
        owner: org,
        repo,
        assignee: collaboratorLogin,
      });
    } catch (error: any) {
      throw new GithubServiceError(
        `Failed to fetch issues assigned to ${collaboratorLogin} in ${org}/${repo}.`,
        error.status,
        error.response?.data
      );
    }
  }
}
