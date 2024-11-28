const mongoose = require('mongoose');

const PullRequestSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
    date: { type: Date },
    githubPrId: { type: String }, // GitHub PR ID
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
    state: { type: String }, // Example: open, closed, merged
    title: { type: String },
  },
  { timestamps: true }
);

PullRequestSchema.index({ githubPrId: 1, repository: 1, organization: 1 }, { unique: true });

PullRequestSchema.statics.createOrUpdatePullRequest = async function (prData, repositoryCollaboratorId, repositoryId, organizationId) {
  const pullRequest = await this.findOneAndUpdate(
    { githubPrId: prData.id, repository: repositoryId, organization: organizationId }, // Match by prId and repository
    {
      $set: {
        creator: repositoryCollaboratorId,
        date: prData.created_at,
        githubPrId: prData.id,
        repository: repositoryId,
        state: prData.state,
        title: prData.title,
      },
    },
    { upsert: true, new: true } // Upsert to create or update the pull request
  );
  return pullRequest;
};

const PullRequest = mongoose.model('PullRequest', PullRequestSchema);

module.exports = PullRequest;
