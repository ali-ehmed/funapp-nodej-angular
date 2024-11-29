import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class OrgService {
  private apiBaseUrl = environment.apiUrl;

  private organizationsSubject = new BehaviorSubject<any>({});
  organizations$ = this.organizationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Method to fetch organizations data
  fetchOrganizations(): void {
    this.http.get<any>(`${this.apiBaseUrl}/api/orgs`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    })  // replace with your API endpoint
      .subscribe((data) => {
        this.organizationsSubject.next(data);  // update the organizations data
      });
  }

  // Optional: You can call this to get the latest organizations without needing to reload
  getOrganizations(): Observable<any> {
    return this.organizations$;
  }
}
