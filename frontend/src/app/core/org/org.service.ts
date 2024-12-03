import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface OrganizationType {
  avatarUrl: string;
  description: string;
  id: string;
  name: string;
  totalRepositories: number;
}

@Injectable(
  { providedIn: 'root' }
)
export class OrgService {
  private apiBaseUrl = environment.apiUrl;

  private organizationsSubject = new BehaviorSubject<OrganizationType[]>([]);
  public organizations$ = this.organizationsSubject.asObservable();

  private loadingOrganizationsSubject = new BehaviorSubject<boolean>(false);
  loadingOrganizations$ = this.loadingOrganizationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Set synchronizing state
  private setLoading(value: boolean): void {
    this.loadingOrganizationsSubject.next(value);
  }

  // Method to fetch organizations data
  fetchOrganizations(): void {
    this.setLoading(true);
    this.http.get<any>(`${this.apiBaseUrl}/api/orgs`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    })
      .subscribe((data) => {
        this.setLoading(false);
        this.organizationsSubject.next(data);
      });
  }

  getOrganizations(): Observable<any> {
    return this.organizations$;
  }

  isOrganizationsLoading(): Observable<any> {
    return this.loadingOrganizations$;
  }
}
