import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-github-auth',
  templateUrl: './github-auth.component.html',
  standalone: false,
})
export class GithubAuthComponent {
  constructor(private authService: AuthService) {}

  get isAuthenticated(): boolean {
    return this.authService.getAuthStatus();
  }

  get connectionDetails() {
    return this.authService.getConnectionDetails();
  }

  connectToGithub(): void {
    this.authService.connect();
  }
}
