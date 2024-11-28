const mongoose = require('mongoose');

const commitSchema = new mongoose.Schema({
  message: { type: String },
  sha: { type: String, unique: true }, // Commit SHA
  date: { type: Date },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }, // Link to repository
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'Member' }, // Link to the author (member)
});

const Commit = mongoose.model('Commit', commitSchema);

module.exports = Commit;
