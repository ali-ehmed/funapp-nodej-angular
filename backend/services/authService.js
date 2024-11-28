const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const findOrUpsertUser = async (profile, accessToken) => {
	const user = await User.findOneAndUpdate(
		{ githubId: profile.id }, // Find user by githubId
		{
			githubId: profile.id,
			username: profile.username,
			name: profile.name,
			profileUrl: profile.profileUrl,
			avatarUrl: profile.avatarUrl,
			accessToken,
			connectedAt: new Date(), // Set connection time
		},
		{
			new: true, // Return the updated document
			upsert: true, // If no document matches, create a new one
			setDefaultsOnInsert: true, // Use default values for missing fields
		},
	);

	// Return the user, including the connection time
	return user;
};

const generateJwt = (user) => {
	return jwt.sign(
		{ userId: user._id, username: user.username },
		process.env.JWT_SECRET,
		{ expiresIn: "1h" },
	);
};

module.exports = { findOrUpsertUser, generateJwt };
