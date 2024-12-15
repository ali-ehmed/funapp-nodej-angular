import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubConnectedCardComponent } from './github-connected-card/github-connected-card.component';
import { MaterialModule } from './material.module';
import { AppRoutingModule } from '../app-routing.module';

@NgModule({
  declarations: [
    GithubConnectedCardComponent
  ],
  imports: [
    AppRoutingModule,
    CommonModule,
    MaterialModule,
  ],
  providers: [],
  exports: [
    GithubConnectedCardComponent
  ],
})
export class SharedModule {}
