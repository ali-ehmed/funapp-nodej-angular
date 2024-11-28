import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  // Observables for isAuthenticated and user
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);

  // Getter to expose these observables
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  public user$ = this.userSubject.asObservable();

  private redirectUrl = `${this.apiUrl}/auth/github`;

  constructor(private http: HttpClient) {}

  // Check if the user is authenticated by calling the backend /check-auth endpoint
  checkAuthInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/check-auth`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }

  // Set authentication data (after login)
  setAuthData(user: any): void {
    this.isAuthenticatedSubject.next(true);
    this.userSubject.next(user);
  }

  clearAuthData(): void {
    this.isAuthenticatedSubject.next(false);
    this.userSubject.next(null);
  }

  // Log out the user
  disconnect(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/logout`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    }).pipe(
      // Reset auth data upon logout
      tap(() => {
        this.isAuthenticatedSubject.next(false);
        this.userSubject.next(null);
      })
    );
  }

  connectToGithub(): Observable<any> {
    // Logic to redirect user to authenticate with GitHub
    window.location.href = this.redirectUrl;
    return new Observable();
  }
}
