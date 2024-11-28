const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema(
  {
    commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }], // Reference to commits made in the repository
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }], // Reference to collaborators in the repository
    description: { type: String },
    fullName: { type: String, required: true },
    githubRepoId: { type: Number, required: true },
    includeFetch: { type: Boolean, default: false },
    last_github_sync_run: { type: Date, default: null },
    name: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
    private: { type: Boolean },
    repoUrl: { type: String },
  },
  { timestamps: true }
);

RepositorySchema.index({ githubRepoId: 1, organization: 1 }, { unique: true });

RepositorySchema.statics.createOrUpdateRepository = async function (repoData, organizationId) {
  // Find the repository by both githubRepoId and organizationId
  const repository = await this.findOneAndUpdate(
    { githubRepoId: repoData.id, organization: organizationId }, // Query for both githubRepoId and organizationId
    {
      $set: {
        fullName: repoData.full_name,
        description: repoData.description,
        githubRepoId: repoData.id,
        name: repoData.name,
        organization: organizationId, // Associate with the organization
        repoUrl: repoData.html_url,
        private: repoData.private,
      },
    },
    { upsert: true, new: true } // upsert: true to insert if not found, new: true to return updated document
  );

  return repository; // Return the created or updated repository
};

// Toggle the includeFetch field for a repository
RepositorySchema.statics.toggleIncludeFetch = async function (repoIds) {
  // First, set includeFetch to false for all repositories except the ones with passed ids
  await this.updateMany(
    { _id: { $nin: repoIds } }, // Exclude repositories with the passed IDs
    { $set: { includeFetch: false } } // Set includeFetch to false
  );

  // Then, set includeFetch to true for the repositories with the passed IDs
  const updatedRepositories = await this.updateMany(
    { _id: { $in: repoIds } },
    { $set: { includeFetch: true } },
    { new: true }
  );

  return updatedRepositories;
};

// Update last_github_sync_run
RepositorySchema.methods.updateLastSyncRun = async function() {
  this.last_github_sync_run = new Date();
  await this.save();
  console.log('Updated last_github_sync_run:', this.last_github_sync_run);
};

const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;
