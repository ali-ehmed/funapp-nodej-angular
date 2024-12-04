import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CellClickedEvent, ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { RepoService, RepositoryType } from '../../../core/repo/repo.service';
import { SyncService } from '../../../core/sync/sync.service';
import { Subject, takeUntil } from 'rxjs';
import { OrganizationType } from '../../../core/org/org.service';

interface IRow {
  id: string;
  name: string;
  repoUrl: string;
  fullName: string;
  includeFetch: boolean;
}

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  standalone: false,
})
export class RepositoriesComponent implements OnInit {
  orgId: string = '';
  organization: OrganizationType | null = null;
  synchronizingRepos: boolean = false;
  includedRepos: string[] = [];
  excludedRepos: string[] = [];
  loadingRepoData: boolean = false;

  private destroy$ = new Subject<void>();

  rowData: RepositoryType[] = [];
  colDefs: ColDef<IRow>[] = [
    {
      headerName: "ID",
      field: 'id',
      cellRenderer: this.idColRenderer,
      onCellClicked: (event: CellClickedEvent) => this.redirectToDetails(event.data.id),
    },
    { field: 'name' },
    {
      headerName: "Link",
      field: 'repoUrl',
      cellRenderer: this.linkColRenderer
    },
    { headerName: "Slug", field: 'fullName' },
    {
      headerName: "Include",
      field: 'includeFetch',
      editable: true,
    }
  ];

  defaultColDef: ColDef = { flex: 1 };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private repoService: RepoService,
    private syncService: SyncService,
  ) {}

  get disabledSyncButton(): boolean {
    return this.synchronizingRepos || this.loadingRepoData || this.includedRepos.length === 0;
  }

  ngOnInit(): void {
    // Accessing query parameters using 'queryParams' observable
    this.activatedRoute.paramMap.subscribe(params => {
      this.orgId = params.get('org_id') || '';
      if (this.orgId) {
        this.loadRepositories();
      } else {
        this.router.navigate(['/']);
      }
    });

    this.syncService.synchronizing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((synchronizing: boolean) => {
        this.synchronizingRepos = synchronizing;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadRepositories(): void {
    this.repoService.isReposLoading()
      .subscribe((loading) => {
        this.loadingRepoData = loading;
      });

    this.repoService.fetchRepositories(this.orgId);

    this.repoService.getRepositories().subscribe({
      next: (data) => {
        this.rowData = data.data ?? [];
        if (this.rowData.length > 0) {
          this.organization = this.rowData[0].organization;
        }

        // Initialize includedRepos and excludedRepos based on the data
        this.includedRepos = this.rowData.filter(repo => repo.includeFetch).map(repo => repo.id);
        this.excludedRepos = this.rowData.filter(repo => !repo.includeFetch).map(repo => repo.id);
      },
      error: (error) => {
        console.error('Error fetching repositories data', error);
      },
    });
  }

  async onSyncRepositories(): Promise<void> {
		this.syncService.syncOrgRepos(this.orgId, this.includedRepos, this.excludedRepos).subscribe({
      error: (error) => {
        console.error('Error synchronizing repositories', error);
      },
      complete: () => {
        this.loadRepositories();
      }
		});
  }

  // Handle cell value changes
  onCellValueChanged(event: any): void {
    console.log('Cell value changed', event);
    const { data, colDef, newValue } = event;

    if (colDef.field === 'includeFetch') {
      if (newValue) {
        // Add the id to includedRepos if checked, remove from excludedRepos
        if (!this.includedRepos.includes(data.id)) {
          this.includedRepos.push(data.id);
        }
        const index = this.excludedRepos.indexOf(data.id);
        if (index > -1) {
          this.excludedRepos.splice(index, 1);
        }
      } else {
        // Add the id to excludedRepos if unchecked, remove from includedRepos
        if (!this.excludedRepos.includes(data.id)) {
          this.excludedRepos.push(data.id);
        }
        const index = this.includedRepos.indexOf(data.id);
        if (index > -1) {
          this.includedRepos.splice(index, 1);
        }
      }
    }
  }

  idColRenderer(params: any) {
    return `<a class="text-blue-400 cursor-pointer">${params.value}</a>`;
  }

  linkColRenderer(params: any): string {
    return `<a href="${params.value}" target="_blank" rel="noopener noreferrer" class="text-blue-400">${params.value}</a>`;
  }

  redirectToDetails(repoId: string): void {
    this.router.navigate(['/orgs', this.orgId, 'repos', repoId, 'details'])
  }
}
