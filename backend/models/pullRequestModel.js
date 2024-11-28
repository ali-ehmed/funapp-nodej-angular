const mongoose = require('mongoose');

const PullRequestSchema = new mongoose.Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
    date: { type: Date },
    githubPrId: { type: String, unique: true }, // GitHub PR ID
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
    state: { type: String }, // Example: open, closed, merged
    title: { type: String },
  },
  { timestamps: true }
);

PullRequestSchema.statics.createOrUpdatePullRequest = async function (prData, repositoryCollaboratorId, repositoryId) {
  const pullRequest = await this.findOneAndUpdate(
    { githubPrId: prData.id, repository: repositoryId }, // Match by prId and repository
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

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

module.exports = PullRequest;
