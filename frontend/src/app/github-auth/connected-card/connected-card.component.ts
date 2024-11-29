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

  @Input() connectedUser: any;
  @Input() lastOrgSyncAt: any;
  @Input() synchronizingOrgs: boolean = false;
  @Output() syncOrganizations = new EventEmitter<void>();
  @Output() disconnectFromGithub = new EventEmitter<void>();

  ngOnInit(): void {
		// Check for the Authorization token in response headers (if it exists in the URL or localStorage)
		this.connectedAt = formatConnectionTime(this.connectedUser.connectedAt);
	}

  async onSyncOrganizations(): Promise<void> {
    await this.syncOrganizations.emit()
  }

  onDisconnectFromGithub(): void {
		this.disconnectFromGithub.emit();
	}
}
