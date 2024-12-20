import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IOrganization } from "./organizationModel";

// Interface for Repository Document
export interface IRepository extends Document {
  commits: mongoose.Types.ObjectId[];
  collaborators: mongoose.Types.ObjectId[];
  description?: string;
  fullName: string;
  githubRepoId: number;
  includeFetch: boolean;
  lastGithubSyncRun: Date | null;
  name: string;
  organization: Types.ObjectId | IOrganization;
  private?: boolean;
  repoUrl?: string;

  // Instance Method
  updateLastSyncRun(): Promise<void>;
}

// Static method interface
export interface IRepositoryModel extends Model<IRepository> {
  createOrUpdateRepository(
    repoData: any,
    organizationId: mongoose.Types.ObjectId
  ): Promise<IRepository>;

  fetchIncludedRepositories(
    repoIds: mongoose.Types.ObjectId[],
    org_id: mongoose.Types.ObjectId
  ): mongoose.Query<IRepository[], IRepository>;

  toggleIncludeFetch(
    repoIds: mongoose.Types.ObjectId[],
    includeFetch: boolean
  ): Promise<void>;
}

// Repository Schema
const RepositorySchema: Schema<IRepository> = new Schema(
  {
    commits: [{ type: mongoose.Schema.Types.ObjectId, ref: "Commit" }],
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "RepositoryCollaborator" }],
    description: { type: String },
    fullName: { type: String, required: true },
    githubRepoId: { type: Number, required: true },
    includeFetch: { type: Boolean, default: false },
    lastGithubSyncRun: { type: Date, default: null },
    name: { type: String, required: true },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true },
    private: { type: Boolean },
    repoUrl: { type: String },
  },
  { timestamps: true }
);

// Text Index for fullName and name search
RepositorySchema.index(
  { fullName: "text", name: "text" },
  { weights: { fullName: 10, name: 5 } }
);

// Unique Index to prevent duplicate repositories
RepositorySchema.index({ githubRepoId: 1, organization: 1 }, { unique: true });

// Static Method: Create or update a repository
RepositorySchema.statics.createOrUpdateRepository = async function (
  repoData: any,
  organizationId: mongoose.Types.ObjectId
): Promise<IRepository> {
  const repository = await this.findOneAndUpdate(
    { githubRepoId: repoData.id, organization: organizationId },
    {
      $set: {
        fullName: repoData.full_name,
        description: repoData.description,
        githubRepoId: repoData.id,
        name: repoData.name,
        organization: organizationId,
        repoUrl: repoData.html_url,
        private: !!repoData.private,
      },
    },
    { upsert: true, new: true }
  );

  return repository;
};

// Static Method: Fetch repositories by organization ID and includeFetch flag
RepositorySchema.statics.fetchIncludedRepositories = function (
  repoIds: mongoose.Types.ObjectId[],
  org_id: mongoose.Types.ObjectId
): mongoose.Query<IRepository[], IRepository> {
  return this.find({
    _id: { $in: repoIds },
    organization: org_id,
    includeFetch: true,
  });
};

// Static Method: Toggle the includeFetch field for repository IDs
RepositorySchema.statics.toggleIncludeFetch = async function (
  repoIds: mongoose.Types.ObjectId[],
  includeFetch: boolean
): Promise<void> {
  await this.updateMany(
    { _id: { $in: repoIds } },
    { $set: { includeFetch } }
  );
};

// Instance Method: Update lastGithubSyncRun
RepositorySchema.methods.updateLastSyncRun = async function (): Promise<void> {
  this.lastGithubSyncRun = new Date();
  await this.save();
  console.log("Updated repository lastGithubSyncRun:", this.lastGithubSyncRun);
};

// Repository Model
const Repository = mongoose.model<IRepository, IRepositoryModel>(
  "Repository",
  RepositorySchema
);

export default Repository;
