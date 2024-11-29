import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { OrgService } from '../services/org.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  standalone: false,
})
export class OrganizationsComponent implements OnInit {
  organizationsData: any[] = [];

  constructor(private orgService: OrgService, private router: Router, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadOrgs()
  }

  loadOrgs(): void {
    // Fetch the initial organizations data
    this.orgService.fetchOrganizations();

    // Subscribe to the organizations data
    this.orgService.getOrganizations().subscribe(data => {
      this.organizationsData = data.data ?? [];
    });
  }
}
