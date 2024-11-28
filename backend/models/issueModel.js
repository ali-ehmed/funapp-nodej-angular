const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    githubIssueId: { type: String, unique: true }, // GitHub Issue ID
    title: { type: String },
    state: { type: String }, // Example: open, closed
    date: { type: Date },
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
  },
  { timestamps: true }
);

IssueSchema.statics.createOrUpdateIssue = async function (issueData, repositoryCollaboratorId, repositoryId) {
  const issue = await this.findOneAndUpdate(
    { githubIssueId: issueData.id, repository: repositoryId }, // Match by issueId and repository
    {
      $set: {
        githubIssueId: issueData.id,
        title: issueData.title,
        state: issueData.state,
        date: issueData.created_at,
        repository: repositoryId,
        assignee: repositoryCollaboratorId,
      },
    },
    { upsert: true, new: true } // Upsert to create or update the issue
  );
  return issue;
};

const Issue = mongoose.model('Issue', IssueSchema);

module.exports = Issue;
