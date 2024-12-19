import { Router } from "express";

import { githubAuth, githubCallback } from "../controllers/githubAuthController";

// Initialize the router
const router: Router = Router();

// Routes for GitHub OAuth authentication
router.get("/github", githubAuth); // Start the GitHub authentication process
router.get("/github/callback", githubCallback); // Handle the callback after GitHub authentication

export default router;
