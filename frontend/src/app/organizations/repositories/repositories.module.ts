import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgService } from '../../services/org.service';
import { RepositoriesComponent } from './repositories.component';

@NgModule({
  declarations: [
    RepositoriesComponent,
  ],
  imports: [
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
  ],
  providers: [OrgService],
  exports: [
    RepositoriesComponent,
  ],
})
export class RepositoriesModule {}
