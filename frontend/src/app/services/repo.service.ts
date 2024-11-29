import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class RepoService {
  private apiBaseUrl = environment.apiUrl;

  private repositoriesSubject = new BehaviorSubject<any>({});
  repositories$ = this.repositoriesSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Method to fetch organizations data
  fetchOrgRepositories(orgId: string): void {
    this.http.get<any>(`${this.apiBaseUrl}/api/orgs/${orgId}/repos`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    })  // replace with your API endpoint
      .subscribe((data) => {
        this.repositoriesSubject.next(data);  // update the organizations data
      });
  }

  // Optional: You can call this to get the latest organizations without needing to reload
  getOrgRepos(): Observable<any> {
    return this.repositories$;
  }
}
