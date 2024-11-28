import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class OrgService {
  private apiBaseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Check if the user is authenticated by calling the backend /check-auth endpoint
  getOrgs(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/orgs`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }
}
