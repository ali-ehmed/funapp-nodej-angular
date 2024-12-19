import mongoose, { Document, Model, Schema } from "mongoose";

// Interface for User Document
export interface IUser extends Document {
  accessToken?: string;
  avatarUrl: string;
  connectedAt: Date;
  lastGithubSyncRun: Date | null;
  githubId: string;
  name: string;
  organizations: mongoose.Types.ObjectId[];
  profileUrl: string;
  username: string;

  // Instance method
  updateLastSyncRun(): Promise<void>;
}

// User Schema
const UserSchema: Schema<IUser> = new Schema(
  {
    accessToken: { type: String },
    avatarUrl: { type: String, required: true },
    connectedAt: { type: Date, default: Date.now },
    lastGithubSyncRun: { type: Date, default: null },
    githubId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: "Organization" }],
    profileUrl: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

// Instance Method: Update lastGithubSyncRun
UserSchema.methods.updateLastSyncRun = async function (): Promise<void> {
  this.lastGithubSyncRun = new Date();
  await this.save();
  console.log("Updated lastGithubSyncRun:", this.lastGithubSyncRun);
};

// User Model
const User = mongoose.model<IUser>("User", UserSchema);

export default User;
