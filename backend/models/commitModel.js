const mongoose = require('mongoose');

const CommitSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
    commitDate: { type: Date },
    message: { type: String },
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
    sha: { type: String, unique: true }, // Commit SHA
  },
  { timestamps: true }
);

CommitSchema.statics.createOrUpdateCommit = async function (commitData, repositoryCollaboratorId, repositoryId) {
  const commit = await this.findOneAndUpdate(
    { sha: commitData.sha, repository: repositoryId }, // Match by sha and repository
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
