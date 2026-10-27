import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environment/environment';
import { AlertsApiService } from './alerts-api.service';

describe('AlertsApiService', () => {
  let service: AlertsApiService;
  let http: HttpTestingController;
  const base = `${environment.apiBaseUrl}/api/cities`;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(AlertsApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('busca cidades enviando apenas os filtros informados', () => {
    service.searchCities({ search: 'belo', state: 'MG', pageSize: 8 }).subscribe();

    const req = http.expectOne((r) => r.url === base);
    expect(req.request.params.get('search')).toBe('belo');
    expect(req.request.params.get('state')).toBe('MG');
    expect(req.request.params.get('pageSize')).toBe('8');
    expect(req.request.params.has('page')).toBeFalse();
    req.flush({ items: [], page: 1, pageSize: 8, total: 0 });
  });

  it('busca uma cidade pelo geocode', () => {
    service.getCity(3106200).subscribe();

    const req = http.expectOne(`${base}/3106200`);
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('busca os alertas com semanas e doença opcionais', () => {
    service.getAlerts(3106200, { weeks: 26, disease: 'zika' }).subscribe();

    const req = http.expectOne((r) => r.url === `${base}/3106200/alerts`);
    expect(req.request.params.get('weeks')).toBe('26');
    expect(req.request.params.get('disease')).toBe('zika');
    req.flush({});
  });

  it('busca os alertas sem filtros', () => {
    service.getAlerts(1).subscribe();

    const req = http.expectOne((r) => r.url === `${base}/1/alerts`);
    expect(req.request.params.keys().length).toBe(0);
    req.flush({});
  });
});
