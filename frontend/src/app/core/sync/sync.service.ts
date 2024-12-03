import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable(
  { providedIn: 'root' }
)
export class SyncService {
  private apiBaseUrl = environment.apiUrl;

  private synchronizingSubject = new BehaviorSubject<boolean>(false);
  synchronizing$ = this.synchronizingSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Set synchronizing state
  private setSynchronizing(value: boolean): void {
    this.synchronizingSubject.next(value);
  }

  syncOrgs(): Observable<any> {
    this.setSynchronizing(true);
    return this.http.post<any>(`${this.apiBaseUrl}/api/orgs/sync-organizations-data`, {}, {
      withCredentials: true, // Send HTTP-only cookies automatically
    }).pipe(
      finalize(() => this.setSynchronizing(false))
    )
  }

  syncOrgRepos(orgId: string, includeRepoIds: string[], excludeRepoIds: string[]): Observable<any> {
    this.setSynchronizing(true);
    return this.http.post<any>(`${this.apiBaseUrl}/api/orgs/${orgId}/sync-repositories-data`,
      {
        include_repository_ids: includeRepoIds,
        exclude_epository_ids: excludeRepoIds
      },
      { withCredentials: true }
    ).pipe(
      finalize(() => this.setSynchronizing(false))
    );
  }
}
