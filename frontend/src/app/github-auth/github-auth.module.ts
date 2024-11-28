import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubAuthComponent } from './github-auth.component';
import { OrgService } from '../services/org.service';
import { ConnectedCardComponent } from './connected-card/connected-card.component';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { GithubAuthRoutingModule } from './github-auth-routing.module';

@NgModule({
  declarations: [
    GithubAuthComponent,
    OrganizationsListComponent, // Declare the component in the module
  ],
  imports: [
    GithubAuthRoutingModule,
    ConnectedCardComponent,
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
  ],
  providers: [OrgService],
  exports: [
    GithubAuthComponent, // Export the component to make it available outside this module
  ],
})
export class GithubAuthModule {}
