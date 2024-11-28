const GithubService = require("../../services/githubService");

const Organization = require("../../models/organizationModel");
const Repository = require("../../models/repositoryModel");

exports.syncOrganizationsData = async (req, res) => {
	const { accessToken: githubAccessToken, _id: userId } = req.user;

	try {
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

		return res.status(200).json({ message: 'Organizations and repositories synced successfully.' });
	} catch (error) {
		console.error('Error syncing GitHub data:', error);
    return res.status(500).json({ message: 'Failed to sync GitHub data' });
	}
};
