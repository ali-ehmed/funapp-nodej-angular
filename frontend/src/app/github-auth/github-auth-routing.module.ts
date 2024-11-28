import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';

const routes: Routes = [
  { path: '', component: OrganizationsListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class GithubAuthRoutingModule {}
