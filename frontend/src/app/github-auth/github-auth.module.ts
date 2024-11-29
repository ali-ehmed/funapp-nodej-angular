import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubAuthComponent } from './github-auth.component';
import { ConnectedCardComponent } from './connected-card/connected-card.component';
import { GithubAuthRoutingModule } from './github-auth-routing.module';
import { RepositoriesComponent } from '../organizations/repositories/repositories.component';
import { OrganizationsModule } from '../organizations/organizations.module';
import { SyncService } from '../services/sync.service';

@NgModule({
  declarations: [
    GithubAuthComponent,
    RepositoriesComponent,
  ],
  imports: [
    GithubAuthRoutingModule,
    OrganizationsModule,
    ConnectedCardComponent,
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
  ],
  providers: [SyncService],
  exports: [
    GithubAuthComponent,
  ],
})
export class GithubAuthModule {}
