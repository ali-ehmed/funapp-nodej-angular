const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		accessToken: { type: String },
		avatarUrl: { type: String, required: true },
		connectedAt: { type: Date, default: Date.now },
		last_github_sync_run: { type: Date, default: null },
		githubId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		name: { type: String, required: true },
		organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
		profileUrl: { type: String, required: true },
	},
	{ timestamps: true }
);

// Update last_github_sync_run
UserSchema.methods.updateLastSyncRun = async function() {
  this.last_github_sync_run = new Date();
  await this.save();
  console.log('Updated last_github_sync_run:', this.last_github_sync_run);
};

const User = mongoose.model("User", UserSchema);

module.exports = User;
