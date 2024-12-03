import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsListComponent } from './components/organizations-list/organizations-list.component';
import { RepositoriesComponent } from './components/repositories/repositories.component';
import { RepoDetailsComponent } from './components/repo-details/repo-details.component';

const routes: Routes = [
  { path: '', component: OrganizationsListComponent },
  {
    path: 'orgs/:org_id',
    children: [
      { path: 'repos', component: RepositoriesComponent },
      { path: 'repos/:repo_id/details', component: RepoDetailsComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
