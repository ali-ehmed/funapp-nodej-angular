import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class SyncService {
  private apiBaseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Check if the user is authenticated by calling the backend /check-auth endpoint
  syncOrgs(): Observable<any> {
    return this.http.post<any>(`${this.apiBaseUrl}/api/orgs/sync-organizations-data`, {}, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }
}
