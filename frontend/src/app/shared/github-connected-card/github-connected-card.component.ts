import { Component, OnInit } from '@angular/core';
import { formatDateTime } from '../../../helpers/dateHelper';
import { AuthService, UserType } from '../../core/auth/auth.service';
import { SyncService } from '../../core/sync/sync.service';
import { filter, map, Subject, takeUntil } from 'rxjs';
import { OrgService } from '../../core/org/org.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RepoService } from '../../core/repo/repo.service';

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
  private currentOrgId: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    public authService: AuthService,
		public orgService: OrgService,
    private router: Router,
    private repoService: RepoService,
		private syncService: SyncService,
  ) {}

  ngOnInit(): void {
    this.orgService.fetchOrganizations();

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

    this.router.events
      .pipe(
        filter(() => !!this.router.routerState.root.firstChild),
        map(() => this.getOrgIdFromRoute(this.router.routerState.root))
      )
      .subscribe((orgId) => {
        this.currentOrgId = orgId;
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
        if (this.currentOrgId) {
          this.repoService.fetchRepositories(this.currentOrgId);
        }

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

  private getOrgIdFromRoute(route: ActivatedRoute): string | null {
    let currentRoute: ActivatedRoute | null = route;

    while (currentRoute?.firstChild) {
      currentRoute = currentRoute.firstChild;
    }

    // Extract 'org_id' from the deepest child route
    return currentRoute?.snapshot.paramMap.get('org_id') || null;
  }
}


