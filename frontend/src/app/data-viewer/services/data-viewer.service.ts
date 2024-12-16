// data-viewer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable()
export class DataViewerService {
  private apiBaseUrl = environment.apiUrl;
  private loadingDataSubject = new BehaviorSubject<boolean>(false);
  private dataViewerSubject = new BehaviorSubject<any | null>(null);

  // Observables
  loadingData$ = this.loadingDataSubject.asObservable();
  dataViewer$ = this.dataViewerSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch collection data from the API
  fetchCollectionData(
    integration: string,
    collection: string,
    page: number = 1,
    perPage: number = 10,
    search: string = ''
  ): void {
    // Set loading state to true
    this.loadingDataSubject.next(true);

    // API call
    this.http
      .get<any>(
        `${this.apiBaseUrl}/api/${integration}/data-viewer/${collection}`,
        {
          withCredentials: true,
          params: {
            page: page.toString(),
            perPage: perPage.toString(),
            search,
          },
        }
      )
      .pipe(
        tap((response) => {
          // Assign fetched data to dataViewerSubject
          this.dataViewerSubject.next(response);
          // Set loading state to false
          this.loadingDataSubject.next(false);
        })
      )
      .subscribe({
        error: (err) => {
          console.error('Error fetching collection data:', err);
          this.loadingDataSubject.next(false); // Ensure loading is false on error
        },
      });
  }

  // Get collection data observable
  getCollectionData(): Observable<any> {
    return this.dataViewer$;
  }

  // Check if collection data is loading
  isCollectionDataLoading(): Observable<boolean> {
    return this.loadingData$;
  }
}
