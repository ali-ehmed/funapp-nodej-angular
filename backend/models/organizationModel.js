const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema({
	name: { type: String, required: true },
	id: { type: Number, required: true },
	avatar_url: { type: String, required: true },
	userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Added userId reference
});

module.exports = mongoose.model("Organization", OrganizationSchema);
