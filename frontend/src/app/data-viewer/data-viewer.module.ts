import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataViewerRoutingModule } from './data-viewer-routing.module';
import { DataViewerComponent } from './data-viewer.component';
import { MaterialModule } from '../shared/material.module';
import { DataViewerService } from './services/data-viewer.service';
import { AgGridModule } from 'ag-grid-angular';


@NgModule({
  declarations: [
    DataViewerComponent
  ],
  imports: [
    AgGridModule,
    CommonModule,
    DataViewerRoutingModule,
    MaterialModule,
  ],
  providers: [DataViewerService]
})
export class DataViewerModule { }
