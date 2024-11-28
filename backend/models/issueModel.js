const mongoose = require("mongoose");

const issueSchema = new mongoose.Schema(
	{
		repoId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Repository",
			required: true,
		},
		issueId: { type: Number, required: true },
		title: { type: String, required: true },
		state: { type: String, required: true },
		createdAt: { type: Date, required: true },
		updatedAt: { type: Date, required: true },
		body: { type: String, default: "" },
	},
	{
		timestamps: true,
	},
);

const Issue = mongoose.model("Issue", issueSchema);

module.exports = Issue;
