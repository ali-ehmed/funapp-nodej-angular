const Organization = require("../../models/Organization");
const Repository = require("../../models/Repository");
const Issue = require("../../models/issueModel");
const PullRequest = require("../../models/pullRequestModel");
const Commit = require("../../models/commitModel");
const axios = require("axios");

exports.syncGithubRepoAndOrg = async (req, res) => {
	try {
		const { accessToken, _id: userId } = req.user;

		if (!accessToken) {
			return res.status(400).json({ message: "Access token is required" });
		}

		const githubApiClient = axios.create({
			baseURL: "https://api.github.com",
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		});

		const { data: organizations } = await githubApiClient.get("/user/orgs");

		for (const org of organizations) {
			const newOrg = new Organization({
				name: org.login,
				id: org.id,
				avatar_url: org.avatar_url,
				userId: userId,
			});
			await newOrg.save();

			const { data: repositories } = await githubApiClient.get(
				`/orgs/${org.login}/repos`,
			);

			for (const repo of repositories) {
				const newRepo = new Repository({
					name: repo.name,
					id: repo.id,
					full_name: repo.full_name,
					organization_id: newOrg._id,
				});
				await newRepo.save();
			}
		}

		res.json({
			message: "Organizations and repositories synced successfully!",
		});
	} catch (error) {
		console.error("Error during syncGithubData:", error);
		res.status(500).json({ message: "Error syncing github data." });
	}
};

exports.getOrganizations = async (req, res) => {
	try {
		const { userId } = req.params;
		const { page = 1, limit = 10 } = req.query;

		const skip = (page - 1) * limit;

		const organizations = await Organization.find({ userId })
			.skip(skip)
			.limit(Number(limit));

		if (organizations.length === 0) {
			return res
				.status(404)
				.json({ message: "No organizations found for this user." });
		}

		const totalOrgs = await Organization.countDocuments({
			userId,
		});

		res.json({
			organizations,
			page: Number(page),
			limit: Number(limit),
			total: totalOrgs,
			totalPages: Math.ceil(totalOrgs / limit),
		});
	} catch (error) {
		console.error("Error fetching organizations:", error);
		res
			.status(500)
			.json({ message: "Error fetching organizations", error: error.message });
	}
};

exports.getRepositories = async (req, res) => {
	try {
		const { organization_id } = req.params;
		const { page = 1, limit = 10 } = req.query;

		const skip = (page - 1) * limit;

		const repositories = await Repository.find({
			organization_id: organization_id,
		})
			.skip(skip)
			.limit(Number(limit));

		if (repositories.length === 0) {
			return res
				.status(404)
				.json({ message: "No repositories found for this organization." });
		}

		const totalRepos = await Repository.countDocuments({
			organization_id: organization_id,
		});

		res.json({
			repositories,
			page: Number(page),
			limit: Number(limit),
			total: totalRepos,
			totalPages: Math.ceil(totalRepos / limit),
		});
	} catch (error) {
		console.error("Error fetching repositories:", error);
		res
			.status(500)
			.json({ message: "Error fetching repositories", error: error.message });
	}
};

exports.getGithubData = async (req, res) => {
	const { repoIds } = req.body;
	const { accessToken, githubId, username } = req.user;

	if (!repoIds || !Array.isArray(repoIds) || repoIds.length === 0) {
		return res
			.status(400)
			.json({ message: "Invalid or missing repository IDs array" });
	}

	const totalCommits = [];
	const totalIssues = [];
	const totalPRs = [];

	try {
		for (const repoId of repoIds) {
			const repository = await Repository.findById(repoId);

			if (!repository) {
				return res
					.status(404)
					.json({ message: `Repository with ID ${repoId} not found` });
			}

			repository.selected = true;
			await repository.save();

			const { full_name } = repository;

			const githubApiClient = axios.create({
				baseURL: "https://api.github.com",
				headers: { Authorization: `Bearer ${accessToken}` },
			});

			const [issues, pullRequests, commits] = await Promise.all([
				githubApiClient.get(`/repos/${full_name}/issues`),
				githubApiClient.get(`/repos/${full_name}/pulls`),
				githubApiClient.get(`/repos/${full_name}/commits`),
			]);

			const issueData = issues.data.map((issue) => ({
				repoId,
				issueId: issue.id,
				title: issue.title,
				state: issue.state,
				createdAt: issue.created_at,
				updatedAt: issue.updated_at,
				body: issue.body,
			}));
			totalIssues.push(...issueData);

			const pullRequestData = pullRequests.data.map((pr) => ({
				repoId,
				prId: pr.id,
				title: pr.title,
				state: pr.state,
				createdAt: pr.created_at,
				updatedAt: pr.updated_at,
				body: pr.body,
			}));
			totalPRs.push(...pullRequestData);

			const commitData = commits.data.map((commit) => ({
				repoId,
				sha: commit.sha,
				message: commit.commit.message,
				date: commit.committer.date,
				author: commit.commit.author.name,
			}));
			totalCommits.push(...commitData);

			await Promise.all([
				Issue.insertMany(issueData),
				PullRequest.insertMany(pullRequestData),
				Commit.insertMany(commitData),
			]);
		}

		res.status(200).json({
			githubId,
			username,
			totalCommits,
			totalIssues,
			totalPRs,
		});
	} catch (error) {
		console.error("Error fetching data for repositories:", error);
		res.status(500).json({
			message: "Error fetching repository data from GitHub.",
			error: error.message,
		});
	}
};
