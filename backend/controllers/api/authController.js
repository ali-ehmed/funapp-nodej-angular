const User = require("../../models/userModel");

exports.checkAuthStatus = async (req, res) => {
	try {
		// If JWT is valid, the user information will be attached to req.user
		const { _id: userId } = req.user; // From the authenticateJWT middleware
		const user = await User.findById(userId);

		if (!user) {
			return;
		}

		// Respond with user data
		res.status(200).json({ user });
	} catch (err) {
		console.error("Error during checkAuthStatus:", err);
		res.status(500).json({ message: "Error checking authentication status" });
	}
};

exports.logout = async (req, res) => {
	try {
		// Clear the JWT cookie
		res.clearCookie("authToken", {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
		});

		// Respond with a 200 OK status and no content
		res.status(200).send();
	} catch (err) {
		console.error("Error during checkAuthStatus:", err);
		res.status(500).json({ message: "Error checking authentication status" });
	}
};
