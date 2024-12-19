import mongoose from "mongoose";
import { Request } from "express";

import { GithubService } from "../../services/githubService/githubService";
import GithubServiceError from "../../lib/githubServiceError";

import Commit from "../../models/commitModel";
import Issue from "../../models/issueModel";
import Organization, { IOrganization } from "../../models/organizationModel";
import PullRequest from "../../models/pullRequestModel";
import Repository from "../../models/repositoryModel";
import RepositoryCollaborator from "../../models/repositoryCollaboratorModel";

import { currentUser } from "../helpers/currentUser";

import { GithubSyncResponse } from "../types/api/githubSyncControllerTypes";

// GET /api/orgs/sync-organizations-data
export const syncOrganizationsData = async (req: Request, res: GithubSyncResponse): Promise<void> => {
  try {
    const user = await currentUser(req);
    const { accessToken: githubAccessToken, _id: userId } = user;

    if (!githubAccessToken) {
      res.status(400).json({
        message: "GitHub access token not found.",
      });
      return;
    }

    const github = new GithubService(githubAccessToken);

    // Fetch the organizations for the user
    const organizations = await github.getUserOrganizations();

    for (const orgData of organizations) {
      // Upsert organization
      const organization = await Organization.createOrUpdateOrganization(orgData, new mongoose.Types.ObjectId(`${userId}`));

      // Fetch repositories for the organization
      const repositories = await github.getOrgRepositories(orgData.login);

      for (const repoData of repositories) {
        // Upsert repository
        await Repository.createOrUpdateRepository(repoData, new mongoose.Types.ObjectId(`${organization._id}`));
      }
    }

    // Update the last sync time for the user
    await user.updateLastSyncRun();

    res.status(200).json({
      message: "Organizations and repositories synced successfully.",
    });
  } catch (error) {
    console.error("Error syncing GitHub data:", error);
    res.status(500).json({
      message: "Failed to sync GitHub data",
    });
  }
};

// GET /api/orgs/:org_id/sync-repositories-data
export const syncRepositoriesData = async (req: Request, res: GithubSyncResponse): Promise<void> => {
  const { accessToken: githubAccessToken } = await currentUser(req.cookies.authToken);
  const { org_id } = req.params;
  const { include_repository_ids, exclude_repository_ids } = req.body;

  if (!githubAccessToken) {
      res.status(400).json({
        message: "GitHub access token not found.",
      });
      return;
    }

  try {
    if ((!include_repository_ids || include_repository_ids.length === 0) && (!exclude_repository_ids || exclude_repository_ids.length === 0)) {
      res.status(400).json({
        message: "Both include_repository_ids and exclude_repository_ids can't be empty. At least one must be provided.",
      });
      return;
    }

    const includeRepoIds = include_repository_ids.map((id: string) => new mongoose.Types.ObjectId(id.toString()));
    const excludeRepoIds = exclude_repository_ids.map((id: string) => new mongoose.Types.ObjectId(id.toString()));

    // Update `includeFetch` for repositories
    await Repository.toggleIncludeFetch(includeRepoIds, true);
    await Repository.toggleIncludeFetch(excludeRepoIds, false);

    // Fetch repositories with `includeFetch` set to true
    const repositories = await Repository
      .fetchIncludedRepositories(includeRepoIds, new mongoose.Types.ObjectId(org_id))
      .populate({
        path: "organization",
        select: "_id name",
      });

    for (const repository of repositories) {
      console.log(`--- Syncing repository data for: ${repository.fullName} ---`);
      const github = new GithubService(githubAccessToken);
      const org = repository.organization as IOrganization
      const orgName = org.name;

      try {
        // Fetch collaborators
        const collaborators = await github.getRepoCollaborators(orgName, repository.name);
        for (const collaborator of collaborators) {
          const collaboratorUserInfoData = await github.getUserInfo(collaborator.login);
          const repoCollaborator = await RepositoryCollaborator.createOrUpdateCollaborator({
            avatar_url: collaboratorUserInfoData.avatar_url,
            name: collaboratorUserInfoData.name,
          }, {
            id: collaborator.id.toString(),
            login: collaborator.login,
          },
          new mongoose.Types.ObjectId(`${repository._id}`),
          new mongoose.Types.ObjectId(`${repository.organization._id}`)
        );

          // Fetch and store commits
          const commits = await github.getRepoCollaboratorAllCommits(orgName, repository.name, repoCollaborator.username);
          for (const commitData of commits) {
            await Commit.createOrUpdateCommit(
              commitData,
              new mongoose.Types.ObjectId(`${repoCollaborator._id}`),
              new mongoose.Types.ObjectId(`${repository._id}`),
              new mongoose.Types.ObjectId(`${repository.organization._id}`)
            );
          }

          // Fetch and store pull requests
          const pullRequests = await github.getRepoCollaboratorPRs(orgName, repository.name, repoCollaborator.username);
          for (const prData of pullRequests) {
            await PullRequest.createOrUpdatePullRequest(
              prData,
              new mongoose.Types.ObjectId(`${repoCollaborator._id}`),
              new mongoose.Types.ObjectId(`${repository._id}`),
              new mongoose.Types.ObjectId(`${repository.organization._id}`)
            );
          }

          // Fetch and store issues
          const issues = await github.getRepoCollaboratorAssignedIssues(orgName, repository.name, repoCollaborator.username);
          for (const issueData of issues) {
            await Issue.createOrUpdateIssue(
              issueData,
              new mongoose.Types.ObjectId(`${repoCollaborator._id}`),
              new mongoose.Types.ObjectId(`${repository._id}`),
              new mongoose.Types.ObjectId(`${repository.organization._id}`)
            );
          }
        }
      } catch (error) {
        if (error instanceof GithubServiceError && error.status === 403) {
          console.error("Error fetching GitHub info:", error.message);
          continue;
        } else {
          throw error;
        }
      }

      // Update repository's last sync run
      await repository.updateLastSyncRun();
    }

    res.status(200).json({
      message: "Repositories data synced successfully.",
    });
  } catch (error) {
    console.error("Error syncing repository data:", error);
    res.status(500).json({
      message: "Failed to sync repository data",
    });
  }
};
