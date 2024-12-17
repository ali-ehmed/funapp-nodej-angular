const ModelConfigSchema = {
  commits: {
    collectionName: 'commits',
    fields: '_id message sha commitDate',
    model: require('../../models/commitModel'),
    references: [
      {
        collectionName: 'repositorycollaborators',
        field: 'author',
        fields: '_id name',
      },
      {
        collectionName: 'repositories',
        field: 'repository',
        fields: '_id name fullName',
      }
    ]
  },
  issues: {
    collectionName: 'issues',
    fields: '_id title state date createdAt',
    model: require('../../models/issueModel'),
    references: [
      {
        collectionName: 'repositorycollaborators',
        field: 'assignee',
        fields: '_id name username',
      },
      {
        collectionName: 'repositories',
        field: 'repository',
        fields: '_id name fullName',
      },
    ],
  },
  organizations: {
    collectionName: 'organizations',
    fields: '_id name description avatarUrl githubOrgId',
    model: require('../../models/organizationModel'),
    references: [], // No references for this model
  },
  'pull-requests': {
    collectionName: 'pullrequests',
    fields: '_id title state date createdAt',
    model: require('../../models/pullRequestModel'),
    references: [
      {
        collectionName: 'repositorycollaborators',
        field: 'creator',
        fields: '_id name username',
      },
      {
        collectionName: 'repositories',
        field: 'repository',
        fields: '_id name fullName',
      },
    ],
  },
  repositories: {
    collectionName: 'repositories',
    model: require('../../models/repositoryModel'),
    fields: '_id name description fullName repoUrl lastGithubSyncRun private includeFetch',
    references: [
      {
        collectionName: 'organizations',
        field: 'organization',
        fields: '_id name',
      },
    ],
  },
  'repository-collaborators': {
    collectionName: 'repositorycollaborators',
    model: require('../../models/repositoryCollaboratorModel'),
    fields: '_id avatarUrl name username',
    references: [
      {
        collectionName: 'repositories',
        field: 'repository',
        fields: '_id name fullName',
      },
    ],
  },
};

module.exports = ModelConfigSchema;
