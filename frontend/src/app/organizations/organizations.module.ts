import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationsListComponent } from './components/organizations-list/organizations-list.component';
import { RepoDetailsComponent } from './components/repo-details/repo-details.component';
import { RepositoriesComponent } from './components/repositories/repositories.component';
import { RepoService } from './services';
import { AgGridModule } from 'ag-grid-angular';
import { OrganizationsRoutingModule } from './organizations-routing.module';

@NgModule({
  declarations: [
    OrganizationsListComponent,
    RepositoriesComponent,
    RepoDetailsComponent,
  ],
  imports: [
    CommonModule,
    AgGridModule,
    OrganizationsRoutingModule
  ],
  providers: [RepoService],
  exports: [],
})
export class OrganizationsModule {}
