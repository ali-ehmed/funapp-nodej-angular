import { Component, OnInit } from '@angular/core';
import { RepoService } from '../../services/repo.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-repositories',
  templateUrl: './repositories.component.html',
  standalone: false,
})
export class RepositoriesComponent implements OnInit {
  repositoriesData: any[] = [];
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private repoService: RepoService
  ) {}

  ngOnInit(): void {
    // Accessing query parameters using 'queryParams' observable
    this.activatedRoute.paramMap.subscribe(params => {
      const orgId = params.get('org_id');
      if (orgId) {
        this.loadOrgRepos(orgId);
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
      this.repositoriesData = data.data ?? [];
    });
  }
}
