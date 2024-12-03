import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { OrganizationType } from '../../core/org/org.service';

export interface RepositoryType {
  description: string;
  fullName: string;
  includeFetch: boolean;
  lastGithubSyncRun: string;
  name: string;
  id: string;
  organization: OrganizationType;
  private: boolean;
  repoUrl: string;
}

@Injectable()
export class RepoService {
  private apiBaseUrl = environment.apiUrl;

  private repositoriesSubject = new BehaviorSubject<RepositoryType[]>([]);
  repositories$ = this.repositoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  fetchRepositories(orgId: string): void {
    this.http.get<any>(`${this.apiBaseUrl}/api/orgs/${orgId}/repos`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    })
      .subscribe((data) => {
        this.repositoriesSubject.next(data);
      });
  }

  getRepositories(): Observable<any> {
    return this.repositories$;
  }

  getRepoDetails(orgId: string, repoId: string): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/orgs/${orgId}/repos/${repoId}/details`, {
      withCredentials: true,
    });
  }
}
