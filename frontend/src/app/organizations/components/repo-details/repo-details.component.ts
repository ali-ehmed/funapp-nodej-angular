import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ColDef } from 'ag-grid-community';
import { RepoService } from '../../../core/repo/repo.service';

interface IRow {
    collaboratorId: string;
    collaboratorName: string;
    collaboratorUsername: string;
    totalCommits: number;
    totalPullRequests: number;
    totalIssues: number;
}

@Component({
  selector: 'app-repo-details',
  templateUrl: './repo-details.component.html',
  standalone: false,
})
export class RepoDetailsComponent implements OnInit {
  orgId: string = '';
  repoId: string = '';

  rowData: any[] = [];
  colDefs: ColDef<IRow>[] = [
    { headerName: "UserID", field: 'collaboratorId' },
    { headerName: "Name", field: 'collaboratorName' },
    { headerName: "Login", field: 'collaboratorUsername', },
    { field: 'totalCommits' },
    { field: 'totalPullRequests' },
    { field: 'totalIssues' },
  ];

  defaultColDef: ColDef = { flex: 1 };

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private repoService: RepoService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.paramMap.subscribe(params => {
      this.orgId = params.get('org_id') || '';
      this.repoId = params.get('repo_id') || '';

      if (this.orgId || this.repoId) {
        this.loadRepoDetails();
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  loadRepoDetails(): void {
    // Fetch the initial organizations data
    this.repoService.getRepoDetails(this.orgId, this.repoId).subscribe(data => {
      this.rowData = data ?? [];
    });
  }
}
