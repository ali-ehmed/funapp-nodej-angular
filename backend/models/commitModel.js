const mongoose = require("mongoose");

const commitSchema = new mongoose.Schema(
	{
		repoId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Repository",
			required: true,
		},
		sha: { type: String, required: true },
		message: { type: String, required: true },
		date: { type: Date, required: true },
		author: { type: String, required: true },
	},
	{
		timestamps: true,
	},
);

const Commit = mongoose.model("Commit", commitSchema);

module.exports = Commit;
