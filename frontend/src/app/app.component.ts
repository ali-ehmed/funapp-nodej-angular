import { Component, OnInit } from '@angular/core';
import { AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
})

export class AppComponent implements OnInit {
  constructor(public authService: AuthService) {}

  ngOnInit(): void {
		this.authService.checkAuthInfo().subscribe({
      next: (response) => {
        console.log('Auth check response:', response);
      },
      error: (error) => {
        console.error('Error during auth check:', error);
      },
      complete: () => {
        console.log('Auth check complete');
      },
    });
	}

  connectToGithub() {
    this.authService.connectToGithub().subscribe({
      error: (error) => {
        console.error('Error connecting to GitHub', error);
      },
    });
  }
}
