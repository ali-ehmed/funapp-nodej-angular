const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  githubId: { type: String, unique: true },
  username: { type: String },
  avatarUrl: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }, // Link to the organization
  commits: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Commit' }],
  pullRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PullRequest' }],
  issues: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Issue' }],
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member;
