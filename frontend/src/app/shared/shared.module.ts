import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GithubConnectedCardComponent } from './github-connected-card/github-connected-card.component';
import { OrgService } from '../organizations/services/org.service';

@NgModule({
  declarations: [
    GithubConnectedCardComponent
  ],
  imports: [
    CommonModule,
  ],
  providers: [OrgService],
  exports: [
    GithubConnectedCardComponent
  ],
})
export class SharedModule {}
