import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubAuthComponent } from './github-auth.component';
import { ConnectedCardComponent } from './connected-card/connected-card.component';
import { GithubAuthRoutingModule } from './github-auth-routing.module';
import { RepositoriesComponent } from '../organizations/repositories/repositories.component';
import { SyncService } from '../services/sync.service';
import { RepoService } from '../services/repo.service';
import { OrganizationsComponent } from '../organizations/organizations.component';
import { OrgService } from '../services/org.service';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  declarations: [
    GithubAuthComponent,
    RepositoriesComponent,
    OrganizationsComponent,
  ],
  imports: [
    GithubAuthRoutingModule,
    ConnectedCardComponent,
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
    AgGridModule,
  ],
  providers: [SyncService, OrgService, RepoService],
  exports: [
    GithubAuthComponent,
  ],
})
export class GithubAuthModule {}
