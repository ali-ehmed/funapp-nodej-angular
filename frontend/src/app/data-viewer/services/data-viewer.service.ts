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

  // Observables
  loadingData$ = this.loadingDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  // Fetch collection data from the API
  fetchCollectionData(
    integration: string,
    collection: string,
    params?: { page?: number; perPage?: number; search?: string, filters?: any }
  ): Observable<any> {
    const { page = 1, perPage = 10, search = '', filters = {} } = params || {};
    // Set loading state to true
    this.loadingDataSubject.next(true);

    // API call
    return this.http
      .get<any>(
        `${this.apiBaseUrl}/api/${integration}/data-viewer/${collection}`,
        {
          withCredentials: true,
          params: {
            page: page.toString(),
            perPage: perPage.toString(),
            search,
            filters: JSON.stringify(filters),
          },
        }
      )
      .pipe(
        tap(() => {
          // Set loading state to false
          this.loadingDataSubject.next(false);
        })
      )
  }

  getDistinctValues(collection: string, field: string): Observable<any> {
    this.loadingDataSubject.next(true);
    return this.http
      .get<any>(`${this.apiBaseUrl}/api/${collection}/distinct-values/${field}`)
      .pipe(
        tap(() => {
          this.loadingDataSubject.next(false);
        })
      );
  }

  // Check if collection data is loading
  isCollectionDataLoading(): Observable<boolean> {
    return this.loadingData$;
  }
}
