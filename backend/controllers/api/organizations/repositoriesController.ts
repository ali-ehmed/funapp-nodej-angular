import mongoose from "mongoose";

import { Request, Response, NextFunction } from "express";

import Commit from "../../../models/commitModel";
import { IOrganization } from "../../../models/organizationModel";
import Issue from "../../../models/issueModel";
import PullRequest from "../../../models/pullRequestModel";
import Repository from "../../../models/repositoryModel";
import RepositoryCollaborator, {
  IRepositoryCollaborator,
} from "../../../models/repositoryCollaboratorModel";

import dataFetcher from "../../../lib/dataFetcher/dataFetcher";
import { paginationParams } from "../../helpers/paginationParams";

import { CollaboratorStats, RepositoryResponse } from "../../types/api/organizations/repositoriesControllerTypes";

// GET /api/orgs/:org_id/repos
export const getRepositoriesForOrg = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { page, perPage } = paginationParams(req);

    const { org_id } = req.params;

    const { results: repositories, totalRecords } = await dataFetcher({
      model: Repository,
      filters: { "organization._id": new mongoose.Types.ObjectId(org_id) },
      page,
      perPage,
      populate: [
        {
          foreignField: "_id",
          from: "organizations",
          path: "organization",
          select: "avatarUrl description _id name",
        },
      ],
      sort: { createdAt: -1 },
    });

    const response: RepositoryResponse[] = repositories.map((repo) => {
      const organization = repo.organization as IOrganization;
      return {
        id: (new mongoose.Types.ObjectId(`${repo._id}`)).toString(),
        repoUrl: repo.repoUrl,
        name: repo.name,
        fullName: repo.fullName,
        includeFetch: repo.includeFetch,
        lastGithubSyncRun: repo.lastGithubSyncRun,
        organization: {
          avatarUrl: organization?.avatarUrl || "",
          description: organization?.description || null,
          id: (new mongoose.Types.ObjectId(`${organization._id}`)).toString(),
          name: organization?.name || "",
        },
      }
    });

    res.locals.paginatedData = response;
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error("Error fetching repositories for organization:", error);
    res.status(500).json({
      message: "Failed to fetch repositories",
    });
  }
};

// GET /api/orgs/:org_id/repos/:repo_id/details
export const getRepositoryDetails = async (req: Request, res: Response) => {
  try {
    const { org_id, repo_id } = req.params;

    const collaborators: IRepositoryCollaborator[] =
      await RepositoryCollaborator.find({
        repository: repo_id,
        organization: org_id,
      });

    const stats: CollaboratorStats[] = await Promise.all(
      collaborators.map(async (collaborator) =>
        getStatsForCollaborator(collaborator, repo_id)
      )
    );

    res.json(stats);
  } catch (error) {
    console.error("Error fetching repository details:", error);
    res.status(500).json({
      message: "Failed to fetch repository details",
    });
  }
};

// Helper function to count total commits, pull requests, and issues for a collaborator
const getStatsForCollaborator = async (
  collaborator: IRepositoryCollaborator,
  repositoryId: string
): Promise<CollaboratorStats> => {
  const totalCommits = await Commit.countDocuments({
    author: collaborator._id,
    repository: repositoryId,
  });
  const totalPullRequests = await PullRequest.countDocuments({
    creator: collaborator._id,
    repository: repositoryId,
  });
  const totalIssues = await Issue.countDocuments({
    assignee: collaborator._id,
    repository: repositoryId,
  });

  return {
    collaboratorId: collaborator.githubCollaboratorId,
    collaboratorName: collaborator.name,
    collaboratorUsername: collaborator.username,
    totalCommits,
    totalPullRequests,
    totalIssues,
  };
};
