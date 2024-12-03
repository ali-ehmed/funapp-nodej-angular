const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		accessToken: { type: String },
		avatarUrl: { type: String, required: true },
		connectedAt: { type: Date, default: Date.now },
		lastGithubSyncRun: { type: Date, default: null },
		githubId: { type: String, required: true, unique: true },
		name: { type: String, required: true },
		organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
		profileUrl: { type: String, required: true },
		username: { type: String, required: true },
	},
	{ timestamps: true }
);

// Update lastGithubSyncRun
UserSchema.methods.updateLastSyncRun = async function() {
  this.lastGithubSyncRun = new Date();
  await this.save();
  console.log('Updated last_github_sync_run:', this.lastGithubSyncRun);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
