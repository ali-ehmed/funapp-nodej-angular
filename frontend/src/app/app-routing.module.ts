import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GithubAuthComponent } from './github-auth/github-auth.component';

const routes: Routes = [
  { path: '', redirectTo: '/github', pathMatch: 'full' }, // Default route
  { path: 'github', component: GithubAuthComponent }, // GitHub Auth route
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
