import { Component, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { SyncService } from '../core/sync/sync.service';

@Component({
  selector: 'app-data-viewer',
  standalone: false,
  
  templateUrl: './data-viewer.component.html',
})
export class DataViewerComponent implements OnInit {
  synchronizingData: boolean = false;
  loadingData: boolean = false;
  private destroy$ = new Subject<void>();

  constructor(
    private syncService: SyncService,
  ) {}

  ngOnInit(): void {
    this.syncService.synchronizing$
      .pipe(takeUntil(this.destroy$))
      .subscribe((synchronizing: boolean) => {
        this.synchronizingData = synchronizing;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
