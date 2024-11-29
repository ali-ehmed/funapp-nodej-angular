import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { RepositoriesComponent } from '../organizations/repositories/repositories.component';
import { RepoDetailsComponent } from '../organizations/repositories/repo-details/repo-details.component';

const routes: Routes = [
  { path: '', component: OrganizationsComponent },
  { path: 'orgs/:org_id/repos', component: RepositoriesComponent },
  { path: 'orgs/:org_id/repos/:repo_id/details', component: RepoDetailsComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class GithubAuthRoutingModule {}
