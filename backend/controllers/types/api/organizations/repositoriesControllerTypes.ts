export interface RepositoryResponse {
  id: string;
  repoUrl: string | undefined;
  name: string;
  fullName: string;
  includeFetch: boolean;
  lastGithubSyncRun: Date | null;
  organization: {
    avatarUrl: string;
    description: string | null;
    id: string;
    name: string;
  };
}

export interface CollaboratorStats {
  collaboratorId: string;
  collaboratorName: string;
  collaboratorUsername: string;
  totalCommits: number;
  totalPullRequests: number;
  totalIssues: number;
}
