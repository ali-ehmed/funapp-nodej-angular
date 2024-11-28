import { Component, OnInit } from '@angular/core';
import { OrgService } from '../../services/org.service';

@Component({
  selector: 'app-organizations-list',
  standalone: false,
  templateUrl: './organizations-list.component.html',
})
export class OrganizationsListComponent implements OnInit {
  organizationsData: any[] = [];

  constructor(private orgService: OrgService) {}

  ngOnInit(): void {
    this.loadOrgs()
  }

  loadOrgs(): void {
    this.orgService.getOrgs().subscribe(
      (data) => {
        this.organizationsData = data.data;  // Store the data in the orgs array
      },
      (error) => {
        console.error('Error loading orgs:', error);
      }
    );
  }
}
