import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UserType {
  avatarUrl: string;
  connectedAt: string;
  id: string;
  lastGithubSyncRun: string;
  name: string;
  profileUrl: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiBaseUrl = environment.apiUrl;

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<UserType | null>(null);

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  private redirectUrl = `${this.apiBaseUrl}/auth/github`;

  constructor(private http: HttpClient) {}

  connectToGithub(): Observable<any> {
    // Logic to redirect user to authenticate with GitHub
    window.location.href = this.redirectUrl;
    return new Observable();
  }

  disconnect(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/auth/logout`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    }).pipe(
      // Reset auth data upon logout
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  // Check if the user is authenticated by calling the backend /check-auth endpoint
  checkAuthInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiBaseUrl}/api/auth/check-auth`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    }).pipe(
      tap((response) => {
        this.setAuthData(response.user);
      }),
      catchError((error) => {
        // If response is 400, clear auth info
        if (error.status === 400) {
          this.clearAuthData();
        }
        // Handle error gracefully (e.g., log it or rethrow)
        return of(null); // Return a safe fallback observable
      })
    )
  }

  // Set authentication data (after login)
  private setAuthData(user: any): void {
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }

  private clearAuthData(): void {
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
  }
}
