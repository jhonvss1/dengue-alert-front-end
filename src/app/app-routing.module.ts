import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CityPageComponent } from './city/city-page/city-page.component';

const routes: Routes = [
  { path: '', component: CityPageComponent },
  { path: 'cidade/:geocode', component: CityPageComponent },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
