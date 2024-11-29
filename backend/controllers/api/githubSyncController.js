const GithubServiceError = require("../../lib/githubServiceError");
const GithubService = require("../../services/githubService");

const Organization = require("../../models/organizationModel");
const Repository = require("../../models/repositoryModel");
const RepositoryCollaborator = require("../../models/repositoryCollaboratorModel");
const Commit = require("../../models/commitModel");
const PullRequest = require("../../models/pullRequestModel");
const Issue = require("../../models/issueModel");

// GET /api/orgs/sync-organizations-data
exports.syncOrganizationsData = async (req, res) => {
	const user = req.user;

	try {
    const { accessToken: githubAccessToken, _id: userId } = user;
		// Fetch the organizations for the user
    const organizations = await GithubService.fetchOrganizationsData(githubAccessToken);

		// Loop over each organization and upsert it into the database
    for (let orgData of organizations) {
      const organization = await Organization.createOrUpdateOrganization(orgData, userId);

      // Fetch repositories for this organization
      const repositories = await GithubService.fetchRepositoriesData(orgData.login, githubAccessToken);

      // Loop through repositories and upsert them into the database
      for (let repoData of repositories) {
        await Repository.createOrUpdateRepository(repoData, organization._id);
      }
    }

    await user.updateLastSyncRun();

		return res.status(200).json({ message: 'Organizations and repositories synced successfully.' });
	} catch (error) {
		console.error('Error syncing GitHub data:', error);
    return res.status(500).json({ message: 'Failed to sync GitHub data' });
	}
};

// GET /api/orgs/:org_id:/sync-repositories-data
exports.syncRepositoriesData = async (req, res) => {
  const { org_id } = req.params;
  const { include_repository_ids, exclude_epository_ids } = req.body;
  const { accessToken: githubAccessToken } = req.user;

  try {
    if ((!include_repository_ids || include_repository_ids.length === 0) && (!exclude_epository_ids || exclude_epository_ids.length === 0)) {
      return res.status(400).json({ message: "Both include_repository_ids or exclude_epository_ids can't be empty. Any one must present." });
    }

    const includeRepoIds = include_repository_ids.map((id) => id.toString());
    const excludeRepoIds = exclude_epository_ids.map((id) => id.toString());

    // Update `includeFetch` for all repositories
    await Repository.toggleIncludeFetch(includeRepoIds, true);
    await Repository.toggleIncludeFetch(excludeRepoIds, false);

    // Fetch all repositories with the specified IDs and current organization in one query
    const repositories = await Repository.fetchIncludedRepositories(includeRepoIds, org_id);

    for (let repository of repositories) {
      console.log(`--- Syncing repository data for: ${repository.fullName} ---`);

      try {
        // Fetch repository collaborators
        const collaborators = await GithubService.fetchRepoCollaborators(repository.fullName, githubAccessToken);

        for (let collaborator of collaborators) {
          const collaboratorUserInfoData = await GithubService.fetchUserInfo(collaborator.id);
          const repoCollaborator = await RepositoryCollaborator.createOrUpdateCollaborator(collaboratorUserInfoData, collaborator, repository._id, repository.organization._id);

          // Fetch and store commits made by the collaborator
          const commits = await GithubService.fetchRepoCollaboratorCommits(repository.fullName, githubAccessToken, repoCollaborator.username);
          for (let commitData of commits) {
            await Commit.createOrUpdateCommit(commitData, repoCollaborator._id, repository._id, repository.organization._id);
          }

          // Fetch and store pull requests created by the collaborator
          const pullRequests = await GithubService.fetchRepoCollaboratorPRs(repository.fullName, githubAccessToken, repoCollaborator.username);
          for (let prData of pullRequests) {
            await PullRequest.createOrUpdatePullRequest(prData, repoCollaborator._id, repository._id, repository.organization._id);
          }

          // Fetch and store issues assigned to the collaborator
          const issues = await GithubService.fetchRepoAssignedIssues(repository.fullName, githubAccessToken, repoCollaborator.username);
          for (let issueData of issues) {
            await Issue.createOrUpdateIssue(issueData, repoCollaborator._id, repository._id, repository.organization._id);
          }
        }
      } catch (error) {
        if (error instanceof GithubServiceError && error.status === 403) {
          continue;
        } else {
          throw new Error(error.message)
        }
      }

      await repository.updateLastSyncRun();
    }

    return res.status(200).json({ message: 'Repositories data synced successfully.' });
  } catch (error) {
    console.error('Error syncing repository data:', error);
    return res.status(500).json({ message: 'Failed to sync repository data' });
  }
}
