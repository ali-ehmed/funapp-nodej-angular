import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { SyncService } from '../services/sync.service';
import { OrgService } from '../services/org.service';
import { formatConnectionTime } from '../../helpers/githubAuthHelper';

@Component({
	selector: 'app-github-auth',
	templateUrl: './github-auth.component.html',
	standalone: false,
})

export class GithubAuthComponent implements OnInit {
	synchronizingOrgs: boolean = false;
	lastOrgSyncAt: string = '';

	constructor(
		public authService: AuthService,
		private syncService: SyncService,
		private orgService: OrgService
	) {}

	ngOnInit(): void {
		this.checkAuthInfo();
	}

	checkAuthInfo(): void {
		this.authService.checkAuthInfo().subscribe(
			(response) => {
				this.authService.setAuthData(response.user);
				this.setLastOrgSyncAt(response.user.last_github_sync_run);
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

	syncOrganizations(): void {
		this.synchronizingOrgs = true;
		this.syncService.syncOrgs().subscribe({
      error: (error) => {
        // Handle the error logic here
				this.synchronizingOrgs = false;
        console.error('Error synchronizing organizations', error);
      },
      complete: () => {
				this.synchronizingOrgs = false;
        this.orgService.fetchOrganizations();
				this.checkAuthInfo();
      }
		});
	}


  setLastOrgSyncAt(last_github_sync_run: any): void {
    this.lastOrgSyncAt = last_github_sync_run ? formatConnectionTime(last_github_sync_run) : '';
  }
}
