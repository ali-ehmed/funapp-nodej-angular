import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubConnectedCardComponent } from './github-connected-card/github-connected-card.component';

@NgModule({
  declarations: [
    GithubConnectedCardComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [],
  exports: [
    GithubConnectedCardComponent
  ],
})
export class SharedModule {}
