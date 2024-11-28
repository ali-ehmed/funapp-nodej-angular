import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { OrgService } from '../services/org.service';
@Component({
	selector: 'app-github-auth',
	templateUrl: './github-auth.component.html',
	standalone: false,
})

export class GithubAuthComponent implements OnInit {
	organizationsData: any[] = [];

	constructor(public authService: AuthService, private orgService: OrgService) {}

	ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.checkAuthInfo();
	}

	checkAuthInfo(): void {
		this.authService.checkAuthInfo().subscribe(
			(response) => {
				this.authService.setAuthData(response.user);
				this.loadOrgs();
			},
			(error) => {
				if (error.status === 401 || error.status === 403) {
					this.authService.clearAuthData();
				}
			}
		);
	}

	loadOrgs(): void {
    this.orgService.getOrgs().subscribe(
      (data) => {
        this.organizationsData = data.data;  // Store the data in the orgs array
      },
      (error) => {
        console.error('Error loading orgs:', error);
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
