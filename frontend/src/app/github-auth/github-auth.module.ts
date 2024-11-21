import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubAuthComponent } from './github-auth.component';
import { AuthService } from '../services/auth.service';

@NgModule({
  declarations: [
    GithubAuthComponent, // Declare the component in the module
  ],
  imports: [
    CommonModule, // Import CommonModule for Angular directives (*ngIf, *ngFor)
  ],
  providers: [AuthService],
  exports: [
    GithubAuthComponent, // Export the component to make it available outside this module
  ],
})
export class GithubAuthModule {}
