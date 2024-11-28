import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { formatConnectionTime } from '../../../helpers/githubAuthHelper';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'github-connected-card',
  templateUrl: './connected-card.component.html',
  imports: [CommonModule]
})
export class ConnectedCardComponent implements OnInit {
  connectedAt: string = '';
	lastOrgSyncAt: string = '';

  @Input() connectedUser: any;
  @Output() syncOrganizations = new EventEmitter<void>();
  @Output() disconnectFromGithub = new EventEmitter<void>();

  ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.connectedAt = formatConnectionTime(this.connectedUser.connectedAt);
    this.lastOrgSyncAt = !!this.connectedUser.last_github_sync_run ? formatConnectionTime(this.connectedUser.last_github_sync_run) : '';
	}

  onSyncOrganizations(): void {
    this.syncOrganizations.emit();  // Emit the userClick event to the parent component
  }

  onDisconnectFromGithub(): void {
		this.disconnectFromGithub.emit();
	}
}
