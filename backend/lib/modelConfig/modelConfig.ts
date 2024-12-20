import { CollectionName } from "./enums";
import { ModelConfig } from "./types";
import CommitModel, { ICommit } from "../../models/commitModel";
import IssueModel, { IIssue } from "../../models/issueModel";
import OrganizationModel, { IOrganization } from "../../models/organizationModel";
import PullRequestModel, { IPullRequest } from "../../models/pullRequestModel";
import RepositoryModel, { IRepository } from "../../models/repositoryModel";
import RepositoryCollaboratorModel, { IRepositoryCollaborator } from "../../models/repositoryCollaboratorModel";

// Strongly typed ModelConfigSchema
const ModelConfigSchema: Record<CollectionName, ModelConfig<any>> = {
  [CollectionName.COMMITS]: {
    collectionName: CollectionName.COMMITS,
    model: CommitModel,
    fields: ["_id", "message", "sha", "commitDate"] as (keyof ICommit)[],
    filterFields: ["_id" ,"commitDate"] as (keyof ICommit)[],
    references: [
      {
        collectionName: CollectionName.REPOSITORY_COLLABORATORS,
        field: "author",
        fields: ["_id", "name"] as (keyof IRepositoryCollaborator)[],
        filterFields: ["name"] as (keyof IRepositoryCollaborator)[],
      },
      {
        collectionName: CollectionName.REPOSITORIES,
        field: "repository",
        fields: ["_id", "name", "fullName"] as (keyof IRepository)[],
        filterFields: ["name"] as (keyof IRepository)[],
      },
    ],
  },
  [CollectionName.ISSUES]: {
    collectionName: CollectionName.ISSUES,
    model: IssueModel,
    fields: ["_id", "title", "state", "date", "createdAt"] as (keyof IIssue)[],
    filterFields: ["state", "date", "createdAt"] as (keyof IIssue)[],
    references: [
      {
        collectionName: CollectionName.REPOSITORY_COLLABORATORS,
        field: "assignee",
        fields: ["_id", "name"] as (keyof IRepositoryCollaborator)[],
        filterFields: ["name"] as (keyof IRepositoryCollaborator)[],
      },
      {
        collectionName: CollectionName.REPOSITORIES,
        field: "repository",
        fields: ["_id", "name", "fullName"] as (keyof IRepository)[],
        filterFields: ["name"] as (keyof IRepository)[],
      },
    ],
  },
  [CollectionName.ORGANIZATIONS]: {
    collectionName: CollectionName.ORGANIZATIONS,
    model: OrganizationModel,
    fields: ["_id", "name", "description", "avatarUrl", "githubOrgId"] as (keyof IOrganization)[],
    filterFields: ["githubOrgId"] as (keyof IOrganization)[],
    references: [],
  },
  [CollectionName.PULL_REQUESTS]: {
    collectionName: CollectionName.PULL_REQUESTS,
    model: PullRequestModel,
    fields: ["_id", "title", "state", "date", "createdAt"] as (keyof IPullRequest)[],
    filterFields: ["state", "date", "createdAt"] as (keyof IPullRequest)[],
    references: [
      {
        collectionName: CollectionName.REPOSITORY_COLLABORATORS,
        field: "creator",
        fields: ["_id", "name", "username"] as (keyof IRepositoryCollaborator)[],
        filterFields: ["name"] as (keyof IRepositoryCollaborator)[],
      },
      {
        collectionName: CollectionName.REPOSITORIES,
        field: "repository",
        fields: ["_id", "name", "fullName"] as (keyof IRepository)[],
        filterFields: ["name"] as (keyof IRepository)[],
      },
    ],
  },
  [CollectionName.REPOSITORIES]: {
    collectionName: CollectionName.REPOSITORIES,
    model: RepositoryModel,
    fields: [
      "_id",
      "name",
      "description",
      "fullName",
      "repoUrl",
      "lastGithubSyncRun",
      "private",
      "includeFetch",
    ] as (keyof IRepository)[],
    filterFields: ["fullName", "lastGithubSyncRun", "private", "includeFetch"] as (keyof IRepository)[],
    references: [
      {
        collectionName: CollectionName.ORGANIZATIONS,
        field: "organization",
        fields: ["_id", "name"] as (keyof IOrganization)[],
        filterFields: ["name"] as (keyof IOrganization)[],
      },
    ],
  },
  [CollectionName.REPOSITORY_COLLABORATORS]: {
    collectionName: CollectionName.REPOSITORY_COLLABORATORS,
    model: RepositoryCollaboratorModel,
    fields: ["_id", "avatarUrl", "name", "username"] as (keyof IRepositoryCollaborator)[],
    filterFields: ["name", "username"] as (keyof IRepositoryCollaborator)[],
    references: [
      {
        collectionName: CollectionName.REPOSITORIES,
        field: "repository",
        fields: ["_id", "name", "fullName"] as (keyof IRepository)[],
        filterFields: ["name"] as (keyof IRepository)[],
      },
    ],
  },
};

export default ModelConfigSchema;
