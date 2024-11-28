const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authenticateUser");
const authController = require("../controllers/api/authController");
const githubController = require("../controllers/api/githubController");

router.get(
	"/auth/check-auth",
	authenticateUser,
	authController.checkAuthStatus,
);
router.get("/auth/logout", authenticateUser, authController.logout);
router.post(
	"/sync-data",
	authenticateUser,
	githubController.syncGithubRepoAndOrg,
);
router.get(
	"/user/:userId/organizations",
	authenticateUser,
	githubController.getOrganizations,
);

router.get(
	"/organization/:organization_id/repositories",
	authenticateUser,
	githubController.getRepositories,
);
router.post(
	"/repositories/data",
	authenticateUser,
	githubController.getGithubData,
);

module.exports = router;
