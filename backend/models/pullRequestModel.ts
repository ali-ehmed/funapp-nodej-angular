import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for PullRequest Document
export interface IPullRequest extends Document {
  creator: mongoose.Types.ObjectId; // Link to RepositoryCollaborator
  date: Date;
  githubPrId: string; // GitHub Pull Request ID
  organization: mongoose.Types.ObjectId; // Link to Organization
  repository: mongoose.Types.ObjectId; // Link to Repository
  state: string; // State: open, closed, merged
  title: string;
}

// Static method interface
export interface IPullRequestModel extends Model<IPullRequest> {
  createOrUpdatePullRequest(
    prData: any,
    repositoryCollaboratorId: mongoose.Types.ObjectId,
    repositoryId: mongoose.Types.ObjectId,
    organizationId: mongoose.Types.ObjectId
  ): Promise<IPullRequest>;
}

// PullRequest Schema
const PullRequestSchema: Schema<IPullRequest> = new Schema(
  {
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "RepositoryCollaborator" }, // Link to RepositoryCollaborator
    date: { type: Date, required: true },
    githubPrId: { type: String, required: true }, // GitHub PR ID
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true }, // Link to Organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true }, // Link to Repository
    state: { type: String, required: true }, // State: open, closed, merged
    title: { type: String, required: true },
  },
  { timestamps: true }
);

// Text Index for title search
PullRequestSchema.index({ title: "text" });

// Unique Index to ensure no duplicate PRs for the same repository and organization
PullRequestSchema.index({ githubPrId: 1, repository: 1, organization: 1 }, { unique: true });

// Static method: Create or update a pull request
PullRequestSchema.statics.createOrUpdatePullRequest = async function (
  prData: any,
  repositoryCollaboratorId: mongoose.Types.ObjectId,
  repositoryId: mongoose.Types.ObjectId,
  organizationId: mongoose.Types.ObjectId
): Promise<IPullRequest> {
  const pullRequest = await this.findOneAndUpdate(
    { githubPrId: prData.id, repository: repositoryId, organization: organizationId }, // Match by PR ID and repository
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

// PullRequest Model
const PullRequest = mongoose.model<IPullRequest, IPullRequestModel>("PullRequest", PullRequestSchema);

export default PullRequest;
