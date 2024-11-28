const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// Middleware to verify JWT token
function authenticateUser(req, res, next) {
	const token = req.cookies.authToken;

	if (!token) {
		return res.status(401).json({ message: "No token provided" }); // Unauthorized if no token
	}

	// Verify the token
	jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
		if (err) {
			return res.status(403).json({ message: "Token is not valid" }); // Forbidden if token is invalid
		}

		const foundUser = await User.findById(user.userId);

		if (!foundUser) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		req.user = foundUser; // Attach the user info to the request object
		next(); // Proceed to the next middleware or route handler
	});
}

module.exports = authenticateUser;
