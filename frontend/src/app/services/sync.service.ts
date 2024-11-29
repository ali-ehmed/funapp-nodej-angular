import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class SyncService {
  private apiBaseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  syncOrgs(): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/orgs/sync-organizations-data`, {}, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }

  syncOrgRepos(orgId: string, includeRepoIds: string[], excludeRepoIds: string[]): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/orgs/${orgId}/sync-repositories-data`,
      {
        include_repository_ids: includeRepoIds,
        exclude_epository_ids: excludeRepoIds
      },
      { withCredentials: true }
    );
  }
}
