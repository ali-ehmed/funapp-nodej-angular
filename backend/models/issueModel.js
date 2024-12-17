const mongoose = require('mongoose');

const IssueSchema = new mongoose.Schema(
  {
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }, // Link to the author (RepositoryCollaborator)
    date: { type: Date },
    githubIssueId: { type: String }, // GitHub Issue ID
    title: { type: String },
    state: { type: String }, // Example: open, closed
    organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
  },
  { timestamps: true }
);

IssueSchema.index({ title: 'text' });
IssueSchema.index({ githubIssueId: 1, repository: 1, organization: 1 }, { unique: true });

IssueSchema.statics.createOrUpdateIssue = async function (issueData, repositoryCollaboratorId, repositoryId, organizationId) {
  const issue = await this.findOneAndUpdate(
    { githubIssueId: issueData.id, repository: repositoryId, organization: organizationId }, // Match by issueId and repository
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
