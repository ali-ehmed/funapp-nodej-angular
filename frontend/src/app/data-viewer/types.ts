export enum CollectionEnum {
  Organizations = 'organizations',
  Repositories = 'repositories',
  RepositoryCollaborators = 'repositorycollaborators',
  PullRequests = 'pullrequests',
  Commits = 'commits',
  Issues = 'issues'
}

export interface Collection {
  slug: CollectionEnum;
  name: string;
}
