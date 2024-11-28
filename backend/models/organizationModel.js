const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    avatarUrl: { type: String, required: true },
    description: { type: String },
    githubOrgId: { type: Number, required: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RepositoryCollaborator' }], // Reference to collaborators in the repositories under the organization
    name: { type: String, required: true },
    repositories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Repository' }], // Repos under the organization
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who is owner of this organization
  },
  { timestamps: true }
);

OrganizationSchema.statics.createOrUpdateOrganization = async function (orgData, userId) {
  // Find the organization by both githubOrgId and userId
  const organization = await this.findOneAndUpdate(
    { githubOrgId: orgData.id, user: userId }, // Query for both githubOrgId and userId
    {
      $set: {
        githubOrgId: orgData.id,
        name: orgData.login,
        description: orgData.description,
        avatarUrl: orgData.avatar_url,
        user: userId, // Ensure the user is associated with the organization
      },
    },
    { upsert: true, new: true } // upsert: true to insert if not found, new: true to return updated document
  );

  return organization; // Return the created or updated organization
};

const Organization = mongoose.model('Organization', OrganizationSchema);

module.exports = Organization;
