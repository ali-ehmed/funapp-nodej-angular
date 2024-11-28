const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema(
  {
    commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }], // Reference to commits made in the repository
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }], // Reference to collaborators in the repository
    description: { type: String },
    fullName: { type: String, required: true },
    githubRepoId: { type: Number, required: true },
    includeFetch: { type: Boolean, default: false },
    name: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
    private: { type: Boolean },
    repoUrl: { type: String },
  },
  { timestamps: true }
);

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


const Repository = mongoose.model('Repository', RepositorySchema);

module.exports = Repository;
