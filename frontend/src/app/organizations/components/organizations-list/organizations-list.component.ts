import { Component, OnInit } from '@angular/core';
import { SyncService } from '../../../core/sync/sync.service';
import { Subject, takeUntil } from 'rxjs';
import { OrganizationType, OrgService } from '../../../core/org/org.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations-list.component.html',
  standalone: false,
})
export class OrganizationsListComponent implements OnInit {
  loadingOrganizationsData: boolean = false;
  synchronizingOrgs: boolean = false;
  organizationsData: OrganizationType[] = [];
  private destroy$ = new Subject<void>();

  constructor(
    private orgService: OrgService,
    private syncService: SyncService
  ) {}

  ngOnInit(): void {
    this.orgService.isOrganizationsLoading()
      .subscribe((loading) => {
        this.loadingOrganizationsData = loading;
      });

    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.organizationsData = data.data ?? [];
      },
      error: (error) => {
        console.error('Error fetching organizations data', error);
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
}
