const mongoose = require('mongoose');

const RepositoryCollaboratorSchema = new mongoose.Schema({
  avatarUrl: { type: String },
  commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }],
  githubCollaboratorId: { type: String, unique: true },
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
  name: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
  pullRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PullRequest' }],
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
  username: { type: String },
});

RepositoryCollaboratorSchema.statics.createOrUpdateCollaborator = async function (userInfoData, collaboratorData, repositoryId, organizationId) {
  // Use findOneAndUpdate to either update or create the collaborator
  const collaborator = await this.findOneAndUpdate(
    { githubCollaboratorId: collaboratorData.id, repository: repositoryId }, // Match on githubUserId and repository
    {
      $set: {
        avatarUrl: userInfoData.avatar_url,
        githubCollaboratorId: collaboratorData.id,
        name: userInfoData.name,
        organization: organizationId, // Associate with the repository
        repository: repositoryId, // Associate with the repository
        username: collaboratorData.login,
      },
    },
    { upsert: true, new: true } // If not found, create it; return the updated document
  );
  return collaborator;
};

const RepositoryCollaborator = mongoose.model('RepositoryCollaborator', RepositoryCollaboratorSchema);

module.exports = RepositoryCollaborator;
