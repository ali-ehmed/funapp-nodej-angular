const express = require("express");
const router = express.Router();

// Middlewares
const authenticateUser = require("../middleware/authenticateUser");
const paginationMiddleware = require("../middleware/paginationMiddleware");
const injectPaginationMetadata = require("../middleware/injectPaginationMetadata");

const authController = require("../controllers/api/authController");
const githubSyncController = require("../controllers/api/githubSyncController");
const organizationsController = require("../controllers/api/organizationsController");
const repositoriesController = require("../controllers/api/organizations/repositoriesController");

// Auth Controller routes
router.get("/auth/check-auth", authenticateUser, authController.checkAuthStatus);
router.get("/auth/logout", authenticateUser, authController.logout);

// GitHub Controller routes
router.post("/orgs/sync-organizations-data", authenticateUser, githubSyncController.syncOrganizationsData);
router.post("/orgs/:org_id/sync-repositories-data", authenticateUser, githubSyncController.syncRepositoriesData);

// Organizations Controller routes
router.get(
  '/orgs',
  authenticateUser,
  paginationMiddleware,
  organizationsController.getOrganizations,
  injectPaginationMetadata
);

// Repositories Controller routes
router.get('/orgs/:org_id/repos',
  authenticateUser,
  paginationMiddleware,
  repositoriesController.getRepositoriesForOrg,
  injectPaginationMetadata
);
router.get('/orgs/:org_id/repos/:repo_id/details',authenticateUser, repositoriesController.getRepositoryDetails);

module.exports = router;
