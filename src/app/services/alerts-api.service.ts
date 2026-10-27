import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';
import { CityAlerts } from '../model/alert';
import { City, PagedResult } from '../model/city';
import { Disease } from '../model/disease';

export interface CitySearchParams {
  search?: string;
  state?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({ providedIn: 'root' })
export class AlertsApiService {
  private readonly citiesUrl = `${environment.apiBaseUrl}/api/cities`;

  constructor(private http: HttpClient) {}

  searchCities(params: CitySearchParams = {}): Observable<PagedResult<City>> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.state) httpParams = httpParams.set('state', params.state);
    if (params.page) httpParams = httpParams.set('page', params.page);
    if (params.pageSize) httpParams = httpParams.set('pageSize', params.pageSize);

    return this.http.get<PagedResult<City>>(this.citiesUrl, { params: httpParams });
  }

  getCity(geocode: number): Observable<City> {
    return this.http.get<City>(`${this.citiesUrl}/${geocode}`);
  }

  /** Na primeira consulta de uma cidade a API busca os dados na fonte externa, o que pode levar alguns segundos. */
  getAlerts(geocode: number, options: { weeks?: number; disease?: Disease } = {}): Observable<CityAlerts> {
    let httpParams = new HttpParams();
    if (options.weeks) httpParams = httpParams.set('weeks', options.weeks);
    if (options.disease) httpParams = httpParams.set('disease', options.disease);

    return this.http.get<CityAlerts>(`${this.citiesUrl}/${geocode}/alerts`, { params: httpParams });
  }
}
