import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { GithubAuthModule } from './github-auth/github-auth.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    GithubAuthModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
