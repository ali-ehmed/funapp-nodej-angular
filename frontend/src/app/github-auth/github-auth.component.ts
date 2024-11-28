import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service'; // Auth service for interaction with backend
import { formatConnectionTime } from '../../helpers/githubAuthHelper'; // Helper function to format connection time
@Component({
	selector: 'app-github-auth',
	templateUrl: './github-auth.component.html',
	standalone: false,
})

export class GithubAuthComponent implements OnInit {
	connectedAt: string = '';

	constructor(public authService: AuthService) {}

	ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.checkAuthInfo();
	}

	checkAuthInfo(): void {
		this.authService.checkAuthInfo().subscribe(
			(response) => {
				this.authService.setAuthData(response.user);
				this.connectedAt = formatConnectionTime(response.user.connectedAt);
			},
			(error) => {
				if (error.status === 401 || error.status === 403) {
					this.authService.clearAuthData();
					this.connectedAt = '';
				}
			}
		);
	}

	// Redirect user to backend to authenticate with GitHub
	connectToGithub(): void {
		this.authService.connectToGithub();
	}

	disconnectFromGithub(): void {
		this.authService.disconnect().subscribe(() => {
			this.authService.clearAuthData();
			this.connectedAt = '';
		});
	}
}
