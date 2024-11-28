const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
    commitDate: { type: Date },
    message: { type: String },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
    sha: { type: String }, // Commit SHA
  },
  { timestamps: true }
);

CommitSchema.index({ sha: 1, repository: 1, organization: 1 }, { unique: true });

CommitSchema.statics.createOrUpdateCommit = async function (commitData, repositoryCollaboratorId, repositoryId, organizationId) {
  const commit = await this.findOneAndUpdate(
    { sha: commitData.sha, repository: repositoryId, organization: organizationId }, // Match by sha and repository
    {
      $set: {
        author: repositoryCollaboratorId,
        commitDate: commitData.commit.author.date,
        message: commitData.commit.message,
        repository: repositoryId,
        sha: commitData.sha,
      },
    },
    { upsert: true, new: true } // Upsert to create or update the commit
  );

  return commit;
};

const Commit = mongoose.model('Commit', CommitSchema);

module.exports = Commit;
