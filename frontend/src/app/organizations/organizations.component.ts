import { Component, OnInit } from '@angular/core';
import { OrgService } from '../services/org.service';

@Component({
  selector: 'app-organizations',
  templateUrl: './organizations.component.html',
  standalone: false,
})
export class OrganizationsComponent implements OnInit {
  organizationsData: any[] = [];

  constructor(private orgService: OrgService) {}

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
