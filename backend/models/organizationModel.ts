import mongoose, { Document, Model, Schema, Types } from "mongoose";
import { IUser } from "./userModel";

// Interface for Organization Document
export interface IOrganization extends Document {
  avatarUrl: string;
  description?: string;
  githubOrgId: number;
  members: mongoose.Types.ObjectId[]; // Array of RepositoryCollaborator IDs
  name: string;
  repositories: mongoose.Types.ObjectId[]; // Array of Repository IDs
  user: Types.ObjectId | IUser; // Reference to User
}

// Static method interface
export interface IOrganizationModel extends Model<IOrganization> {
  createOrUpdateOrganization(
    orgData: any,
    userId: mongoose.Types.ObjectId
  ): Promise<IOrganization>;
}

// Organization Schema
const OrganizationSchema: Schema<IOrganization> = new Schema(
  {
    avatarUrl: { type: String, required: true },
    description: { type: String },
    githubOrgId: { type: Number, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "RepositoryCollaborator" }],
    name: { type: String, required: true },
    repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Repository" }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// Text Index for Search
OrganizationSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 10, description: 5 } }
);

// Static method: Create or update an organization
OrganizationSchema.statics.createOrUpdateOrganization = async function (
  orgData: any,
  userId: mongoose.Types.ObjectId
): Promise<IOrganization> {
  const organization = await this.findOneAndUpdate(
    { githubOrgId: orgData.id, user: userId }, // Query for both githubOrgId and userId
    {
      $set: {
        githubOrgId: orgData.id,
        name: orgData.login,
        description: orgData.description,
        avatarUrl: orgData.avatar_url,
        user: userId,
      },
    },
    { upsert: true, new: true } // Insert if not found, return the updated document
  );

  return organization;
};

// Organization Model
const Organization = mongoose.model<IOrganization, IOrganizationModel>(
  "Organization",
  OrganizationSchema
);

export default Organization;
