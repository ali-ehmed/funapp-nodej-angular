const express = require('express');
const router = express.Router();
const githubAuthController = require('../controllers/githubAuthController');

// Routes for GitHub OAuth authentication
router.get('/github', githubAuthController.githubAuth); // Start the GitHub authentication process
router.get('/github/callback', githubAuthController.githubCallback); // Handle the callback after GitHub authentication

module.exports = router;
