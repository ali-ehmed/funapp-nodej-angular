import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', loadChildren: () => import('./organizations/organizations.module').then(m => m.OrganizationsModule) },
  { path: 'data-viewer', loadChildren: () => import('./data-viewer/data-viewer.module').then(m => m.DataViewerModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
