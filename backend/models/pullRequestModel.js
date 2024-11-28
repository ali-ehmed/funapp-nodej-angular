const mongoose = require('mongoose');

const pullRequestSchema = new mongoose.Schema({
  title: { type: String },
  state: { type: String }, // Example: open, closed, merged
  githubPrId: { type: String, unique: true }, // GitHub PR ID
  date: { type: Date },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Link to the author (member)
});

const PullRequest = mongoose.model('PullRequest', pullRequestSchema);

module.exports = PullRequest;
