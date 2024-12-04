const Repository = require("../../../models/repositoryModel");
const RepositoryCollaborator = require('../../../models/repositoryCollaboratorModel');
const Commit = require('../../../models/commitModel');
const PullRequest = require('../../../models/pullRequestModel');
const Issue = require('../../../models/issueModel');

const paginatedResultsHelper = require('../../../helpers/paginationResultsHelper');

// GET /api/orgs/:org_id/repos
exports.getRepositoriesForOrg = async (req, res, next) => {
  try {
    const { org_id } = req.params;
    const { page, perPage } = req.pagination;

    // Fetch repositories for the specific organization with pagination
    const repositories = await paginatedResultsHelper.getPaginatedResults(
      Repository,
      { organization: org_id },
      page,
      perPage,
      { path: 'organization', select: 'avatarUrl description _id name' }
    );

    const response = repositories.map(repo => ({
      id: repo._id,
      repoUrl: repo.repoUrl,
      name: repo.name,
      fullName: repo.fullName,
      includeFetch: repo.includeFetch,
      lastGithubSyncRun: repo.lastGithubSyncRun,
      organization: {
        avatarUrl: repo.organization.avatarUrl,
        description: repo.organization.description,
        id: repo.organization._id,
        name: repo.organization.name
      },
    }));

    // Set the paginated data in res.locals for the pagination middleware
    res.locals.paginatedData = response;
    res.locals.totalCount = await Repository.countDocuments({
      organization: org_id
    });

    next();
  } catch (error) {
    console.error('Error fetching repositories for organization:', error);
    return res.status(500).json({
      message: 'Failed to fetch repositories'
    });
  }
};

// GET /api/orgs/:org_id/repos/:repo_id/details
exports.getRepositoryDetails = async (req, res) => {
  try {
    const { org_id, repo_id } = req.params;

    // Fetch the collaborators for the given repository
    const collaborators = await RepositoryCollaborator.find({
      repository: repo_id,
      organization: org_id
    });

    // Get stats for each collaborator
    const stats = await Promise.all(
      collaborators.map(async (collaborator) => {
        return await getStatsForCollaborator(collaborator, repo_id);
      })
    );

    return res.json(stats); // Return the stats for each collaborator
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return res.status(500).json({
      message: 'Failed to fetch repository details'
    });
  }
};

// Helper function to count total commits, pull requests, and issues for a collaborator
async function getStatsForCollaborator(collaborator, repositoryId) {
  const totalCommits = await Commit.countDocuments({
    author: collaborator._id,
    repository: repositoryId
  });
  const totalPullRequests = await PullRequest.countDocuments({
    creator: collaborator._id,
    repository: repositoryId
  });
  const totalIssues = await Issue.countDocuments({
    assignee: collaborator._id,
    repository: repositoryId
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
