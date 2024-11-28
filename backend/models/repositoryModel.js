const mongoose = require("mongoose");

const RepositorySchema = new mongoose.Schema({
	name: { type: String, required: true },
	id: { type: Number, required: true },
	full_name: { type: String, required: true },
	organization_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Organization",
	},
	selected: { type: Boolean, default: false },
});

module.exports = mongoose.model("Repository", RepositorySchema);
