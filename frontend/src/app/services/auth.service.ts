import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  private isAuthenticated = false;
  private connectionDetails = {
    username: '',
    connectedAt: '',
  };

  constructor() {}

  // Check if the user is authenticated
  getAuthStatus(): boolean {
    return this.isAuthenticated;
  }

  // Simulate connecting the user
  connect(): void {
    this.isAuthenticated = true;
    this.connectionDetails = {
      username: 'GithubUser', // Placeholder username
      connectedAt: new Date().toLocaleString(),
    };
  }

  // Get connection details
  getConnectionDetails() {
    return this.connectionDetails;
  }
}
 