const mongoose = require('mongoose');

const Organization = require("../../models/organizationModel");
const Repository = require("../../models/repositoryModel");

const dataFetcher = require('../../lib/dataFetcher');

// GET /api/orgs
exports.getOrganizations = async (req, res, next) => {
  try {
    const { page, perPage } = req.pagination;

    // Fetch organizations for the current user with pagination
    const { results: organizations, totalRecords } = await dataFetcher({
      model: Organization,
      filters: { user: new mongoose.Types.ObjectId(req.user._id) },
      page,
      perPage,
    });

    // Get the total repositories count for each organization
    const response = await Promise.all(
      organizations.map(async (org) => {
        const totalRepositories = await Repository.countDocuments({ organization: org._id });

        return {
          id: org._id,
          avatarUrl: org.avatarUrl,
          name: org.name,
          totalRepositories, // Count of repositories in this organization
        };
      })
    );

    // Set the paginated data in res.locals for the pagination middleware
    res.locals.paginatedData = response;
    res.locals.totalCount = totalRecords;

    next();
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return res.status(500).json({ message: 'Failed to fetch organizations' });
  }
};
