import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for Issue Document
export interface IIssue extends Document {
  assignee: mongoose.Types.ObjectId;
  date: Date;
  githubIssueId: string;
  title: string;
  state: string; // e.g., "open" or "closed"
  organization: mongoose.Types.ObjectId;
  repository: mongoose.Types.ObjectId;
}

// Static method interface
export interface IIssueModel extends Model<IIssue> {
  createOrUpdateIssue(
    issueData: any,
    repositoryCollaboratorId: mongoose.Types.ObjectId,
    repositoryId: mongoose.Types.ObjectId,
    organizationId: mongoose.Types.ObjectId
  ): Promise<IIssue>;
}

// Issue Schema
const IssueSchema: Schema<IIssue> = new Schema(
  {
    assignee: { type: mongoose.Schema.Types.ObjectId, ref: "RepositoryCollaborator" }, // Link to the assignee
    date: { type: Date },
    githubIssueId: { type: String, required: true }, // GitHub Issue ID
    title: { type: String, required: true },
    state: { type: String, required: true }, // Issue state: open, closed
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true }, // Link to organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true }, // Link to repository
  },
  { timestamps: true }
);

// Text Index for title search
IssueSchema.index({ title: "text" });

// Unique Index for ensuring no duplicates
IssueSchema.index({ githubIssueId: 1, repository: 1, organization: 1 }, { unique: true });

// Static method: Create or update an issue
IssueSchema.statics.createOrUpdateIssue = async function (
  issueData: any,
  repositoryCollaboratorId: mongoose.Types.ObjectId,
  repositoryId: mongoose.Types.ObjectId,
  organizationId: mongoose.Types.ObjectId
): Promise<IIssue> {
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

// Issue Model
const Issue = mongoose.model<IIssue, IIssueModel>("Issue", IssueSchema);

export default Issue;
