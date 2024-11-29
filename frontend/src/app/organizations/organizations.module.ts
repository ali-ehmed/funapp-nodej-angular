import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgService } from '../services/org.service';
import { OrganizationsComponent } from './organizations.component';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [
    OrganizationsComponent,
  ],
  imports: [
    RouterModule,
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
  ],
  providers: [OrgService],
  exports: [
    OrganizationsComponent,
  ],
})
export class OrganizationsModule {}
