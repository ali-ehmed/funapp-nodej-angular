import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataViewerRoutingModule } from './data-viewer-routing.module';
import { DataViewerComponent } from './data-viewer.component';
import { MaterialModule } from '../shared/material.module';


@NgModule({
  declarations: [
    DataViewerComponent
  ],
  imports: [
    CommonModule,
    DataViewerRoutingModule,
    MaterialModule,
    
  ]
})
export class DataViewerModule { }
