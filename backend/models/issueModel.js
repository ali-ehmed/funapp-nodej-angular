const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema({
  title: { type: String },
  state: { type: String }, // Example: open, closed
  githubIssueId: { type: String, unique: true }, // GitHub Issue ID
  date: { type: Date },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Link to the author (member)
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;
