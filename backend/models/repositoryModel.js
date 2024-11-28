const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema({
	githubRepoId: { type: Number, required: true },
	name: { type: String, required: true },
	fullName: { type: String, required: true },
	repoUrl: { type: String },
	private: { type: Boolean },
	organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
	commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }], // Reference to commits made in the repository
});

RepositorySchema.statics.createOrUpdateRepository = async function (repoData, organizationId) {
  // Find the repository by both githubRepoId and organizationId
  const repository = await this.findOneAndUpdate(
    { githubRepoId: repoData.id, organization: organizationId }, // Query for both githubRepoId and organizationId
    {
      $set: {
        githubRepoId: repoData.id,
        name: repoData.name,
        fullName: repoData.full_name,
        description: repoData.description,
        repoUrl: repoData.html_url,
        private: repoData.private,
        organization: organizationId, // Associate with the organization
      },
    },
    { upsert: true, new: true } // upsert: true to insert if not found, new: true to return updated document
  );

  return repository; // Return the created or updated repository
};

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;
