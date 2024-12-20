import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SyncService } from '../core/sync/sync.service';
import { debounce } from 'lodash';
import { Collection, CollectionEnum } from './types';
import { DataViewerService } from './services/data-viewer.service';
import { ColDef } from 'ag-grid-community';
import moment from 'moment';

@Component({
  selector: 'app-data-viewer',
  standalone: false,
  templateUrl: './data-viewer.component.html',
})
export class DataViewerComponent implements OnInit {
  collections: Collection[] = [
    { slug: CollectionEnum.Organizations, name: 'Organizations' },
    { slug: CollectionEnum.Repositories, name: 'Repositories' },
    { slug: CollectionEnum.RepositoryCollaborators, name: 'Repository Collaborators' },
    { slug: CollectionEnum.PullRequests, name: 'Pull Requests' },
    { slug: CollectionEnum.Commits, name: 'Commits' },
    { slug: CollectionEnum.Issues, name: 'Issues' }
  ];
  columnDefs: ColDef[] = [];
  defaultColDef: ColDef = {
    flex: 1,
    floatingFilter: true
  };
  gridApi: any;
  gridColumnApi: any;
  loadingData: boolean = false;
  pageSize = 3; // Rows per page
  rowData: any[] = [];
  searchTerm: string = '';
  synchronizingData: boolean = false;
  selectedIntegration = 'github';
  selectedCollection: CollectionEnum = CollectionEnum.Organizations;
  searchQuery: string = '';
  private destroy$ = new Subject<void>();

  serverSideDatasource = {
    getRows: (params: any) => {
      // Extract filters, sort, and pagination info from AG Grid
      const request = this.buildRequest(params);

      // Fetch data from the server
      this.dataViewerService
        .fetchCollectionData(this.selectedIntegration, this.selectedCollection, request)
        .subscribe({
          next: (data) => {
            params.successCallback(data.data.rows, data.pagination.total); // Update AG Grid with data
          },
          error: () => {
            params.failCallback(); // Handle failure
          },
        });
    },
  };

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

    // Load initial data
    this.dataViewerService
      .fetchCollectionData(
        this.selectedIntegration,
        this.selectedCollection,
        {
          page: 1,
          perPage: this.pageSize,
        }
      )
      .subscribe((data) => {
        if (data && data.data) {
          this.columnDefs = this.mapColumnsToColDefs(data.data.columns);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Cancel any pending debounced calls when the component is destroyed
    this.onSearchDebounced.cancel();
  }

  onGridReady(params: any) {
    this.gridApi = params.api;

    // Set up the server-side data source
    this.gridApi.setGridOption("datasource", this.serverSideDatasource);
  }

  buildRequest(params: any): any {
    const filterModel = params.filterModel || {};
    const sortModel = params.sortModel || [];

    return {
      search: this.searchTerm, // Add global search term if applicable
      page: Math.floor(params.startRow / this.pageSize) + 1, // Calculate page number
      perPage: this.pageSize, // Number of rows per page
      filters: this.constructFilters(filterModel), // Convert AG Grid filter model to server format
      sort: sortModel.length > 0 ? sortModel[0].colId : null, // Sort column
      sortOrder: sortModel.length > 0 ? sortModel[0].sort : null, // Sort order
    };
  }

  // Handle entity selection change
  onCollectionChange(collection: CollectionEnum): void {
    this.searchQuery = '';
    this.dataViewerService
      .fetchCollectionData(
        this.selectedIntegration,
        collection,
        {
          page: 1,
          perPage: this.pageSize,
        }
      )
      .subscribe((data) => {
        if (data && data.data) {
          this.columnDefs = this.mapColumnsToColDefs(data.data.columns);
        }
        this.gridApi.setGridOption("datasource", this.serverSideDatasource);
      });
  }

  // Handle search query change
  onSearch(query: string): void {
    this.onSearchDebounced(query);
  }

  // Actual search logic
  private performSearch(query: string): void {
    this.searchTerm = query;
    this.gridApi.setGridOption("datasource", this.serverSideDatasource);
  }

  private mapColumnsToColDefs(columns: any[]): any[] {
    return columns.map((column) => {
      // Determine the filter type based on column metadata or default to 'text'
      let filterType: string | boolean | null = null; // Default to basic filter
      if (column.type === 'date') {
        filterType = 'agDateColumnFilter';
      } else if (column.type === 'number') {
        filterType = 'agNumberColumnFilter';
      } else if (column.type === 'text') {
        filterType = 'agTextColumnFilter';
      } else if (column.type === 'reference') {
        filterType = 'agSetColumnFilter';
      } else if (column.type === 'boolean') {
        filterType = 'agSetColumnFilter';
      }

      return {
        headerName: column.headerName,
        field: column.field,
        ...(
          filterType
            ? {
                filter: filterType,
                filterParams: this.getFilterParams(column),
              }
            : {}
        ),
        ...(
          column.type === 'boolean'
            ? {
                valueFormatter: (params: any) => (params.value ? 'Yes' : 'No'),
                cellRenderer: null
              }
            :
          column.type === 'date'
            ? {
              valueFormatter: (params: any) => {
                if (params.value) {
                  return moment(params.value).format('YYYY-MM-DD hh:mm a'); // Format the date
                }
                return '';
              }
            }
            : {}
        )
      };
    });
  }

  private getFilterParams(column: any): any {
    const columnType = column.type;
    const defaultParams = {
      maxNumConditions: 1
    }

    if (columnType === 'date') {
      return {
        filterOptions: ['equals', 'lessThan', 'greaterThan'],
        comparator: (filterDate: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          if (cellDate < filterDate) return -1;
          if (cellDate > filterDate) return 1;
          return 0;
        },
        ...defaultParams,
        debounceMs: 300
      };
    }

    if (columnType === 'text') {
      return {
        filterOptions: ['contains'],
        debounceMs: 500, // Add debounce for better performance
        ...defaultParams,
      };
    }

    if (columnType === 'number') {
      return {
        filterOptions: ['equals'],
        debounceMs: 500,
        ...defaultParams,
      };
    }

    // This filter will require ag-grid-enterprise to work
    if (columnType === 'reference') {
      return {
        values: (params: any) => {
          // Fetch distinct values for the reference field
          this.dataViewerService
            .getDistinctValues(column.referenceCollection, column.referenceKey)
            .subscribe((distinctValues) => {
              params.success(distinctValues);
            });
        },
        debounceMs: 500, // Add debounce for performance
        ...defaultParams,
      };
    }

    if (columnType === 'boolean') {
      console.log('boolean')
      return {
        values: ['Yes', 'No'],
        debounceMs: 500, // Add debounce for performance
        ...defaultParams,
      };
    }

    return null; // Default params for non-specialized columns
  }

  private constructFilters(filterModel: any): any {
    const filters: any = {};

    Object.keys(filterModel).forEach((field) => {
      const filter = filterModel[field];

      if (filter.filterType === 'text') {
        // Handle text filters (e.g., contains, equals)
        filters[field] = filter.filter;
      } else if (filter.filterType === 'number') {
        // Handle number filters (e.g., equals, lessThan)
        if (filter.type === 'equals') {
          filters[field] = filter.filter;
        } else if (filter.type === 'lessThan') {
          filters[field] = { $lt: filter.filter };
        } else if (filter.type === 'greaterThan') {
          filters[field] = { $gt: filter.filter };
        }
      } else if (filter.filterType === 'date') {
        if (filter.type === 'equals') {
          // Match exact date (normalize both start and end of the day for precision)
          const startOfDay = this.normalizeToStartOfDay(filter.dateFrom);
          const endOfDay = this.normalizeToEndOfDay(filter.dateFrom);
          filters[field] = { $gte: startOfDay, $lte: endOfDay };
        } else if (filter.type === 'lessThan') {
          // Match dates less than the provided date (normalize to start of the day)
          filters[field] = { $lt: this.normalizeToStartOfDay(filter.dateFrom) };
        } else if (filter.type === 'greaterThan') {
          // Match dates greater than the provided date (normalize to end of the day)
          filters[field] = { $gt: this.normalizeToEndOfDay(filter.dateFrom) };
        } else if (filter.type === 'between') {
          // Match dates between a range
          if (filter.dateFrom && filter.dateTo) {
            filters[field] = {
              $gte: this.normalizeToStartOfDay(filter.dateFrom),
              $lte: this.normalizeToEndOfDay(filter.dateTo),
            };
          } else if (filter.dateFrom) {
            filters[field] = { $gte: this.normalizeToStartOfDay(filter.dateFrom) };
          } else if (filter.dateTo) {
            filters[field] = { $lte: this.normalizeToEndOfDay(filter.dateTo) };
          }
        }
      } else if (filter.filterType === 'set') {
        // Handle reference (set) filters
        filters[field] = { $in: filter.values }; // Use $in for matching multiple values
      }
    });

    return filters;
  }

  private normalizeToStartOfDay = (dateString: string): string => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString(); // Start of day
  };

  private normalizeToEndOfDay = (dateString: string): string => {
    const date = new Date(dateString);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString(); // End of day
  };
}
