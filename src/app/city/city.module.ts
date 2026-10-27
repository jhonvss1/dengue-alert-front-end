import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertSummaryComponent } from './alert-summary/alert-summary.component';
import { CitySearchComponent } from './city-search/city-search.component';
import { WeeklyChartComponent } from './weekly-chart/weekly-chart.component';

@NgModule({
  declarations: [CitySearchComponent, AlertSummaryComponent, WeeklyChartComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CitySearchComponent, AlertSummaryComponent, WeeklyChartComponent],
})
export class CityModule {}
