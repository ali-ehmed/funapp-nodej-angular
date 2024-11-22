import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
  constructor(private http: HttpClient) {}

  private apiUrl = environment.apiUrl;

  public redirectUrl = `${this.apiUrl}/auth/github`;

  // Check if the user is authenticated by calling the backend /check-auth endpoint
  checkAuthInfo(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/check-auth`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }

  // Log out the user
  disconnect(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/logout`, {
      withCredentials: true, // Send HTTP-only cookies automatically
    });
  }
}
