import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SyncService } from '../core/sync/sync.service';
import { debounce } from 'lodash';
import { Collection, CollectionEnum } from './types';
import { DataViewerService } from './services/data-viewer.service';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-data-viewer',
  standalone: false,
  
  templateUrl: './data-viewer.component.html',
})
export class DataViewerComponent implements OnInit {
  defaultColDef: ColDef = { flex: 1 };

  synchronizingData: boolean = false;
  loadingData: boolean = false;
  private destroy$ = new Subject<void>();

  selectedIntegration = 'github';
  selectedCollection: CollectionEnum = CollectionEnum.Organizations;
  searchQuery: string = '';

  collections: Collection[] = [
    { slug: CollectionEnum.Organizations, name: 'Organizations' },
    { slug: CollectionEnum.Repositories, name: 'Repositories' },
    { slug: CollectionEnum.RepositoryCollaborators, name: 'Repository Collaborators' },
    { slug: CollectionEnum.PullRequests, name: 'Pull Requests' },
    { slug: CollectionEnum.Commits, name: 'Commits' },
    { slug: CollectionEnum.Issues, name: 'Issues' }
  ];

  columnDefs: ColDef[] = [];
  rowData: any[] = [];

  onSearchDebounced = debounce((query: string) => {
    this.performSearch(query);
  }, 300);

  constructor(
    private dataViewerService: DataViewerService,
    private syncService: SyncService,
  ) {}

  ngOnInit(): void {
    this.syncService.synchronizing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((synchronizing: boolean) => {
        this.synchronizingData = synchronizing;
      });

    // Subscribe to loading state
    this.dataViewerService.isCollectionDataLoading().subscribe((isLoading) => {
      this.loadingData = isLoading;
    });

    this.dataViewerService.fetchCollectionData(this.selectedIntegration, this.selectedCollection);

    // Subscribe to data
    this.dataViewerService.getCollectionData().subscribe((data) => {
      if (data && data.data) {
        this.columnDefs = this.mapColumnsToColDefs(data.data.columns);
        this.rowData = data.data.rows;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Cancel any pending debounced calls when the component is destroyed
    this.onSearchDebounced.cancel();
  }

  // Handle entity selection change
  onCollectionChange(collection: CollectionEnum): void {
    this.dataViewerService.fetchCollectionData(this.selectedIntegration, collection);
  }

  // Handle search query change
  onSearch(query: string): void {
    this.onSearchDebounced(query);
  }

  // Actual search logic
  private performSearch(query: string): void {
    this.dataViewerService.fetchCollectionData(this.selectedIntegration, this.selectedCollection, 1, 10, query);
  }

  /**
   * Map columns from API to AG Grid column definitions.
   * @param columns - Columns from the API response
   * @returns ColDef[] - Configured column definitions
   */
  private mapColumnsToColDefs(columns: { field: string; headerName: string }[]): ColDef[] {
    return columns.map((column) => (
      {
        headerName: column.headerName,
        field: column.field,
      }
    ));
  }
}
