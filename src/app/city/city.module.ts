import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CitySearchComponent } from './city-search/city-search.component';

@NgModule({
  declarations: [CitySearchComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CitySearchComponent],
})
export class CityModule {}
