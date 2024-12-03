import { Component, OnInit } from '@angular/core';
import { OrgService } from '../../services';
import { OrganizationType } from '../../services/org.service';
import { SyncService } from '../../../core/sync/sync.service';
import { Subject, takeUntil } from 'rxjs';

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
    this.loadOrgs()
  }

  loadOrgs(): void {
    this.loadingOrganizationsData = true;
    // Fetch the initial organizations data
    this.orgService.fetchOrganizations();

    // Subscribe to the organizations data
    this.orgService.getOrganizations().subscribe({
      next: (data) => {
        this.loadingOrganizationsData = false;
        this.organizationsData = data.data ?? [];
      },
      error: (error) => {
        this.loadingOrganizationsData = false;
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
