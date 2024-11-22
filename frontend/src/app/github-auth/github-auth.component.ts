import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Auth service for interaction with backend
import { formatConnectionTime } from '../../helpers/githubAuthHelper'; // Helper function to format connection time
@Component({
	selector: 'app-github-auth',
  	templateUrl: './github-auth.component.html',
  	standalone: false,
})

export class GithubAuthComponent implements OnInit {
	isAuthenticated = false; // Track authentication status
	user: any = null; // Store user data
	connectedAt: string = '';

	constructor(private authService: AuthService) {}

	ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.checkAuthInfo();
	}

	checkAuthInfo(): void {
		this.authService.checkAuthInfo().subscribe(
			(response) => {
				this.isAuthenticated = true;
				this.user = response.user; // Assuming the backend returns the user data in the `user` property
				this.connectedAt = formatConnectionTime(this.user.connectedAt);
			},
			(error) => {
				if (error.status === 401 || error.status === 403) {
					this.isAuthenticated = false;
					this.user = null;
					this.connectedAt = '';
				}
			}
		);
	}

	// Redirect user to backend to authenticate with GitHub
	connectToGithub(): void {
		window.location.href = this.authService.redirectUrl;
	}

	disconnectFromGithub(): void {
		this.authService.disconnect().subscribe(() => {
			this.isAuthenticated = false;
			this.user = null;
			this.connectedAt = '';
		});
	}
}
