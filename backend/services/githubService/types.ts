import { Endpoints } from "@octokit/types";

export interface GitHubProfile {
  id: string;
  avatar_url: string;
  name: string;
  html_url: string;
  login: string;
}

// Custom error type
export interface GithubServiceErrorData {
  message: string;
  status: number;
  details?: any;
}

// Define types for Octokit responses
export type UserAuthenticatedResponse =
  Endpoints["GET /user"]["response"]["data"];

export type OrganizationResponse =
  Endpoints["GET /user/orgs"]["response"]["data"];

export type RepositoryResponse =
  Endpoints["GET /orgs/{org}/repos"]["response"]["data"];

export type CollaboratorsResponse =
  Endpoints["GET /repos/{owner}/{repo}/collaborators"]["response"]["data"];

export type UserInfoResponse =
  Endpoints["GET /users/{username}"]["response"]["data"];

export type BranchesResponse =
  Endpoints["GET /repos/{owner}/{repo}/branches"]["response"]["data"];

export type CommitsResponse =
  Endpoints["GET /repos/{owner}/{repo}/commits"]["response"]["data"];

export type PullRequestsResponse =
  Endpoints["GET /repos/{owner}/{repo}/pulls"]["response"]["data"];

export type IssuesResponse =
  Endpoints["GET /repos/{owner}/{repo}/issues"]["response"]["data"];
