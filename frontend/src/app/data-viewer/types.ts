export enum CollectionEnum {
  Organizations = 'organizations',
  Repositories = 'repositories',
  RepositoryCollaborators = 'repository-collaborators',
  PullRequests = 'pull-requests',
  Commits = 'commits',
  Issues = 'issues'
}

export interface Collection {
  slug: CollectionEnum;
  name: string;
}
