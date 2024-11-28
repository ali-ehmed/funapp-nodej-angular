const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		accessToken: { type: String },
		avatarUrl: { type: String, required: true },
		connectedAt: { type: Date, default: Date.now },
		githubId: { type: String, required: true, unique: true },
		username: { type: String, required: true },
		name: { type: String, required: true },
		organizations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }],
		profileUrl: { type: String, required: true },
	},
	{ timestamps: true }
);

const User = mongoose.model("User", UserSchema);

module.exports = User;
