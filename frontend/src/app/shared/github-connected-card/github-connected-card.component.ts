import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { formatDateTime } from '../../../helpers/dateHelper';
import { AuthService, UserType } from '../../core/auth/auth.service';
import { SyncService } from '../../core/sync/sync.service';
import { OrgService } from '../../organizations/services/org.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'github-connected-card',
  templateUrl: './github-connected-card.component.html',
  standalone: false,
})
export class GithubConnectedCardComponent implements OnInit {
  connectedAt: string = '';
  lastOrgSyncAt: string = '';
  user: UserType | null = null;
  synchronizingOrgs: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
		public syncService: SyncService,
		private orgService: OrgService,
  ) {}

  ngOnInit(): void {
    this.authService.user$
      .pipe(takeUntil(this.destroy$))
      .subscribe((user) => {
        if (user) {
          this.user = user;
          this.lastOrgSyncAt = user.lastGithubSyncRun
            ? formatDateTime(user.lastGithubSyncRun)
            : '';

          this.connectedAt = user.connectedAt
            ? formatDateTime(user.connectedAt)
            : '';
        }
      });

    this.syncService.synchronizing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((synchronizing) => {
        this.synchronizingOrgs = synchronizing;
      });
	}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async onSyncOrganizations(): Promise<void> {
    this.syncService.syncOrgs().subscribe({
      error: (error) => {
        console.error('Error synchronizing organizations', error);
      },
      complete: () => {
        this.orgService.fetchOrganizations();
        this.authService.checkAuthInfo().subscribe({
          next: (response) => {
            console.log('Refetch auth check response:', response);
          },
          error: (error) => {
            console.error('Error during auth check:', error);
          },
          complete: () => {
            console.log('Refetch auth check complete');
          },
        });
      }
		});
  }

  onDisconnectFromGithub(): void {
    this.authService.disconnect().subscribe(() => {
      console.log('Disconnected from GitHub');
    })
	}
}


