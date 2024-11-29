import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { RepositoriesComponent } from '../organizations/repositories/repositories.component';

const routes: Routes = [
  { path: '', component: OrganizationsComponent },
  { path: 'orgs/:org_id/repos', component: RepositoriesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class GithubAuthRoutingModule {}
