const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	githubId: { type: String, required: true, unique: true },
	username: { type: String, required: true },
	name: { type: String, required: true },
	profileUrl: { type: String, required: true },
	avatarUrl: { type: String, required: true },
	accessToken: { type: String, required: true },
	connectedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
