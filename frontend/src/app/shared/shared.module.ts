import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubConnectedCardComponent } from './github-connected-card/github-connected-card.component';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [
    GithubConnectedCardComponent
  ],
  imports: [
    CommonModule,
    MaterialModule,
  ],
  providers: [],
  exports: [
    GithubConnectedCardComponent
  ],
})
export class SharedModule {}
