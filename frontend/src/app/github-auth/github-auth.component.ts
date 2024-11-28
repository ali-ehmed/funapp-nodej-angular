import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
	selector: 'app-github-auth',
	templateUrl: './github-auth.component.html',
	standalone: false,
})

export class GithubAuthComponent implements OnInit {
	organizationsData: any[] = [];

	constructor(public authService: AuthService) {}

	ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.checkAuthInfo();
	}

	checkAuthInfo(): void {
		this.authService.checkAuthInfo().subscribe(
			(response) => {
				this.authService.setAuthData(response.user);
			},
			(error) => {
				if (error.status === 401 || error.status === 403) {
					this.authService.clearAuthData();
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
		});
	}

	syncOrganizations(): void {}
}
