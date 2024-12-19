import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for Commit Document
export interface ICommit extends Document {
  author: mongoose.Types.ObjectId;
  commitDate: Date;
  message: string;
  organization: mongoose.Types.ObjectId;
  repository: mongoose.Types.ObjectId;
  sha: string;
}

// Static method interface
export interface ICommitModel extends Model<ICommit> {
  createOrUpdateCommit(
    commitData: any,
    repositoryCollaboratorId: mongoose.Types.ObjectId,
    repositoryId: mongoose.Types.ObjectId,
    organizationId: mongoose.Types.ObjectId
  ): Promise<ICommit>;
}

// Commit Schema
const CommitSchema: Schema<ICommit> = new Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "RepositoryCollaborator" }, // Link to the author
    commitDate: { type: Date, required: true },
    message: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true }, // Link to organization
    repository: { type: mongoose.Schema.Types.ObjectId, ref: "Repository", required: true }, // Link to repository
    sha: { type: String, required: true }, // Commit SHA
  },
  { timestamps: true }
);

// Text Index for search
CommitSchema.index({ sha: "text", message: "text" });

// Unique Index
CommitSchema.index({ sha: 1, repository: 1, organization: 1 }, { unique: true });

// Static method: Create or update a commit
CommitSchema.statics.createOrUpdateCommit = async function (
  commitData: any,
  repositoryCollaboratorId: mongoose.Types.ObjectId,
  repositoryId: mongoose.Types.ObjectId,
  organizationId: mongoose.Types.ObjectId
): Promise<ICommit> {
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

// Commit Model
const Commit = mongoose.model<ICommit, ICommitModel>("Commit", CommitSchema);

export default Commit;
