import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { CityAlerts } from 'src/app/model/alert';
import { AlertsApiService } from 'src/app/services/alerts-api.service';
import { alert } from '../testing';
import { CityPageComponent, errorMessage, parseWeeks } from './city-page.component';

const BH = { geocode: 3106200, name: 'Belo Horizonte', state: 'MG', isTracked: true, lastSyncedAt: '2025-03-10T06:00:00' };

function response(overrides: Partial<CityAlerts> = {}): CityAlerts {
  return {
    city: BH,
    lastSyncedAt: BH.lastSyncedAt,
    isStale: false,
    alerts: [
      alert('dengue', 2025, 9, 100, 1),
      alert('dengue', 2025, 10, 200, 2),
      alert('zika', 2025, 10, 5, 1),
    ],
    ...overrides,
  };
}

describe('CityPageComponent', () => {
  let fixture: ComponentFixture<CityPageComponent>;
  let component: CityPageComponent;
  let api: jasmine.SpyObj<AlertsApiService>;
  let router: jasmine.SpyObj<Router>;
  let params$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let query$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const element = () => fixture.nativeElement as HTMLElement;

  function create(geocode?: string, query: Record<string, string> = {}): void {
    params$.next(convertToParamMap(geocode ? { geocode } : {}));
    query$.next(convertToParamMap(query));
    fixture = TestBed.createComponent(CityPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(() => {
    localStorage.clear();
    api = jasmine.createSpyObj<AlertsApiService>('AlertsApiService', ['getAlerts']);
    api.getAlerts.and.returnValue(of(response()));
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    params$ = new BehaviorSubject(convertToParamMap({}));
    query$ = new BehaviorSubject(convertToParamMap({}));

    TestBed.configureTestingModule({
      declarations: [CityPageComponent],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: AlertsApiService, useValue: api },
        { provide: Router, useValue: router },
        { provide: ActivatedRoute, useValue: { paramMap: params$, queryParamMap: query$ } },
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('mostra o estado vazio quando não há cidade na URL nem lembrada', () => {
    create();

    expect(component.state.kind).toBe('empty');
    expect(api.getAlerts).not.toHaveBeenCalled();
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('redireciona para a última cidade consultada', () => {
    localStorage.setItem('dengue-alert:last-geocode', '3106200');
    create();

    expect(router.navigate).toHaveBeenCalledWith(['/cidade', 3106200], jasmine.objectContaining({ replaceUrl: true }));
  });

  it('carrega a cidade da URL, lembra dela e lista a doença selecionada da semana mais recente para a mais antiga', () => {
    create('3106200');

    expect(api.getAlerts).toHaveBeenCalledOnceWith(3106200, { weeks: 12 });
    expect(localStorage.getItem('dengue-alert:last-geocode')).toBe('3106200');
    expect(component.city?.name).toBe('Belo Horizonte');
    expect(element().querySelector('h2')?.textContent).toContain('Belo Horizonte');
    expect(element().querySelector('.updated')?.textContent).toContain('10/03/2025');

    const rows = Array.from(element().querySelectorAll('tbody tr th')).map((th) => th.textContent?.trim());
    expect(rows).toEqual(['10/2025', '9/2025']);
  });

  it('filtra pela doença da URL e ignora valores inválidos', () => {
    create('3106200', { disease: 'zika' });
    expect(element().querySelectorAll('tbody tr').length).toBe(1);

    query$.next(convertToParamMap({ disease: 'gripe' }));
    fixture.detectChanges();
    expect(component.disease).toBe('dengue');
    expect(element().querySelectorAll('tbody tr').length).toBe(2);
  });

  it('refaz a consulta ao mudar o período, mas não ao mudar a doença', () => {
    create('3106200');

    query$.next(convertToParamMap({ disease: 'zika' }));
    expect(api.getAlerts).toHaveBeenCalledTimes(1);

    query$.next(convertToParamMap({ disease: 'zika', weeks: '26' }));
    expect(api.getAlerts).toHaveBeenCalledTimes(2);
    expect(api.getAlerts).toHaveBeenCalledWith(3106200, { weeks: 26 });
  });

  it('navega preservando a query ao escolher doença, período e cidade', () => {
    create('3106200');

    component.onDiseaseChange('chikungunya');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { disease: 'chikungunya' }, queryParamsHandling: 'merge',
    }));

    component.onWeeksChange('52');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { weeks: 52 }, queryParamsHandling: 'merge',
    }));

    component.onCitySelected({ ...BH, geocode: 3550308 });
    expect(router.navigate).toHaveBeenCalledWith(['/cidade', 3550308], { queryParamsHandling: 'preserve' });
  });

  it('avisa quando os dados estão desatualizados', () => {
    api.getAlerts.and.returnValue(of(response({ isStale: true })));
    create('3106200');

    expect(element().querySelector('.stale')?.textContent).toContain('últimos dados salvos');
  });

  it('mostra o erro e permite tentar novamente', () => {
    api.getAlerts.and.returnValue(throwError(() => new HttpErrorResponse({ status: 503 })));
    create('3106200');

    expect(component.state.kind).toBe('error');
    expect(element().querySelector('.error')?.textContent).toContain('indisponível');

    api.getAlerts.and.returnValue(of(response()));
    component.retry();
    expect(component.state.kind).toBe('ready');
  });

  it('avisa que a primeira consulta pode demorar', fakeAsync(() => {
    const pending = new Subject<CityAlerts>();
    api.getAlerts.and.returnValue(pending);
    create('3106200');

    expect(component.state.kind).toBe('loading');
    expect(component.slowLoad).toBeFalse();

    tick(2600);
    fixture.detectChanges();
    expect(element().querySelector('.slow')?.textContent).toContain('primeira consulta');

    pending.next(response());
    pending.complete();
    expect(component.state.kind).toBe('ready');
    expect(component.slowLoad).toBeFalse();
  }));

  it('mostra mensagem de que não há dados da doença no período', () => {
    api.getAlerts.and.returnValue(of(response({ alerts: [alert('zika', 2025, 10, 5)] })));
    create('3106200');

    expect(element().querySelector('.no-data')?.textContent).toContain('Sem dados de Dengue');
    expect(element().querySelector('table')).toBeNull();
  });
});

describe('parseWeeks', () => {
  it('aceita só as opções oferecidas', () => {
    expect(parseWeeks('26')).toBe(26);
    expect(parseWeeks('7')).toBe(12);
    expect(parseWeeks(null)).toBe(12);
  });
});

describe('errorMessage', () => {
  it('traduz os status mais comuns', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 0 }))).toContain('conectar');
    expect(errorMessage(new HttpErrorResponse({ status: 404 }))).toContain('não encontrado');
    expect(errorMessage(new HttpErrorResponse({ status: 503 }))).toContain('indisponível');
    expect(errorMessage(new HttpErrorResponse({ status: 500 }))).toContain('erro');
    expect(errorMessage(new Error('x'))).toContain('erro');
  });
});
