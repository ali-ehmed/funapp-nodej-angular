import { Component, OnInit } from '@angular/core';
import { RepoService } from '../../services/repo.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';

import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { SyncService } from '../../services/sync.service';

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
  repositoriesData: any[] = [];

  synchronizingRepos = false;
  includedRepos: string[] = [];

  themeClass = "ag-theme-quartz";

  rowData: any[] = [];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef<IRow>[] = [
    { headerName: "ID", field: 'id' },
    { field: 'name' },
    {
      headerName: "Link",
      field: 'repoUrl',
      cellRenderer: this.linkRenderer
    },
    { headerName: "Slug", field: 'fullName' },
    {
      headerName: "Include",
      field: 'includeFetch',
      editable: true,
    }
  ];

  defaultColDef: ColDef = {
      flex: 1,
  };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private repoService: RepoService,
    private syncService: SyncService,
  ) {}

  // Computed property to determine if the button should be disabled
  get disabledSyncButton(): boolean {
    return this.synchronizingRepos || this.includedRepos.length === 0;
  }

  ngOnInit(): void {
    // Accessing query parameters using 'queryParams' observable
    this.activatedRoute.paramMap.subscribe(params => {
      this.orgId = params.get('org_id') || '';
      if (this.orgId) {
        this.loadOrgRepos(this.orgId);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadOrgRepos(orgId: string): void {
    // Fetch the initial organizations data
    this.repoService.fetchOrgRepositories(orgId);

    // Subscribe to the organizations data
    this.repoService.getOrgRepos().subscribe(data => {
      console.log(data)
      this.rowData = data.data ?? [];
    });
  }

  onCellValueChanged(event: any): void {
    const { data, colDef, newValue } = event;

    if (colDef.field === 'includeFetch') {
      if (newValue) {
        this.includedRepos.push(data.id);
      } else {
        // Remove the id from the includedRepos array
        const index = this.includedRepos.indexOf(data.id);
        if (index > -1) {
          this.includedRepos.splice(index, 1);
        }
      }
    }
  }

  linkRenderer(params: any): string {
    return `<a href="${params.value}" target="_blank" rel="noopener noreferrer" class="text-blue-400">${params.value}</a>`;
  }

  onSyncRepositories(): void {
    this.synchronizingRepos = true;
		this.syncService.syncOrgs().subscribe({
      error: (error) => {
        // Handle the error logic here
				this.synchronizingRepos = false;
        console.error('Error synchronizing repositories', error);
      },
      complete: () => {
				this.synchronizingRepos = false;
        this.repoService.fetchOrgRepositories(this.orgId);
      }
		});
  }
}
