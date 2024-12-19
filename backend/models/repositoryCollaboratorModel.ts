import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for RepositoryCollaborator Document
export interface IRepositoryCollaborator extends Document {
  avatarUrl?: string;
  commits: mongoose.Types.ObjectId[];
  githubCollaboratorId: string;
  issues: mongoose.Types.ObjectId[];
  name: string;
  organization: mongoose.Types.ObjectId;
  pullRequests: mongoose.Types.ObjectId[];
  repository: mongoose.Types.ObjectId;
  username: string;
}

// Static method interface
export interface IRepositoryCollaboratorModel extends Model<IRepositoryCollaborator> {
  createOrUpdateCollaborator(
    userInfoData: {
      avatar_url: string;
      name: string | null;
    },
    collaboratorData: {
      id: string;
      login: string;
    },
    repositoryId: mongoose.Types.ObjectId,
    organizationId: mongoose.Types.ObjectId
  ): Promise<IRepositoryCollaborator>;
}

// RepositoryCollaborator Schema
const RepositoryCollaboratorSchema: Schema<IRepositoryCollaborator> = new Schema(
  {
    avatarUrl: { type: String },
    commits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commit" }],
    githubCollaboratorId: { type: String, required: true },
    issues: [{ type: mongoose.Schema.Types.ObjectId, ref: "Issue" }],
    name: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    pullRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "PullRequest" }],
    repository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true },
    username: { type: String },
  },
  { timestamps: true }
);

// Text Index for searching on name and username
RepositoryCollaboratorSchema.index(
  { name: "text", username: "text" },
  { weights: { name: 10, username: 5 } }
);

// Unique Index to ensure no duplicate collaborators for the same repository and organization
RepositoryCollaboratorSchema.index(
  { githubCollaboratorId: 1, repository: 1, organization: 1 },
  { unique: true }
);

// Static Method: Create or update a collaborator
RepositoryCollaboratorSchema.statics.createOrUpdateCollaborator = async function (
  userInfoData: { avatar_url: string; name: string },
  collaboratorData: { id: string; login: string },
  repositoryId: mongoose.Types.ObjectId,
  organizationId: mongoose.Types.ObjectId
): Promise<IRepositoryCollaborator> {
  const collaborator = await this.findOneAndUpdate(
    { githubCollaboratorId: collaboratorData.id, repository: repositoryId, organization: organizationId }, // Match based on IDs
    {
      $set: {
        avatarUrl: userInfoData.avatar_url,
        githubCollaboratorId: collaboratorData.id,
        name: userInfoData.name,
        organization: organizationId,
        repository: repositoryId,
        username: collaboratorData.login,
      },
    },
    { upsert: true, new: true } // Create if not found, otherwise update
  );

  return collaborator;
};

// RepositoryCollaborator Model
const RepositoryCollaborator = mongoose.model<
  IRepositoryCollaborator,
  IRepositoryCollaboratorModel
>("RepositoryCollaborator", RepositoryCollaboratorSchema);

export default RepositoryCollaborator;
