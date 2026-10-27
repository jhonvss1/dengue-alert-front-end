import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AlertSummaryComponent } from './alert-summary/alert-summary.component';
import { CityPageComponent } from './city-page/city-page.component';
import { CitySearchComponent } from './city-search/city-search.component';
import { WeeklyChartComponent } from './weekly-chart/weekly-chart.component';

@NgModule({
  declarations: [CityPageComponent, CitySearchComponent, AlertSummaryComponent, WeeklyChartComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CityPageComponent, CitySearchComponent, AlertSummaryComponent, WeeklyChartComponent],
})
export class CityModule {}
