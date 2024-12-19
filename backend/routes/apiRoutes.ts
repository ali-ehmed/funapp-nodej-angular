import { Router } from "express";

// Middlewares
import authenticateUser from "../middleware/authenticateUser";
import injectPaginationMetadata from "../middleware/injectPaginationMetadata";

// Controllers
import { checkAuthStatus, logout } from "../controllers/api/authController";
import { syncOrganizationsData, syncRepositoriesData } from "../controllers/api/githubSyncController";
import { getOrganizations } from "../controllers/api/organizationsController";
import { getRepositoriesForOrg, getRepositoryDetails } from "../controllers/api/organizations/repositoriesController";
import { getCollectionsData } from "../controllers/api/dataViewerController";

// Initialize the router
const router: Router = Router();

// Auth Controller routes
router.get("/auth/check-auth", authenticateUser, checkAuthStatus);
router.get("/auth/logout", authenticateUser, logout);

// GitHub Controller routes
router.post(
  "/orgs/sync-organizations-data",
  authenticateUser,
  syncOrganizationsData
);

router.post(
  "/orgs/:org_id/sync-repositories-data",
  authenticateUser,
  syncRepositoriesData
);

// Organizations Controller routes
router.get(
  "/orgs",
  authenticateUser,
  getOrganizations,
  injectPaginationMetadata
);

// Repositories Controller routes
router.get(
  "/orgs/:org_id/repos",
  authenticateUser,
  getRepositoriesForOrg,
  injectPaginationMetadata
);
router.get(
  "/orgs/:org_id/repos/:repo_id/details",
  authenticateUser,
  getRepositoryDetails
);

// Data Viewer Controller routes
router.get(
  "/:integration/data-viewer/:collection",
  authenticateUser,
  getCollectionsData,
  injectPaginationMetadata
);

export default router;
