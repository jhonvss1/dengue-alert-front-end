import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { City } from 'src/app/model/city';
import { AlertsApiService } from 'src/app/services/alerts-api.service';
import { CitySearchComponent } from './city-search.component';

const BH: City = { geocode: 3106200, name: 'Belo Horizonte', state: 'MG', isTracked: false, lastSyncedAt: null };
const BETIM: City = { geocode: 3106705, name: 'Betim', state: 'MG', isTracked: false, lastSyncedAt: null };

describe('CitySearchComponent', () => {
  let fixture: ComponentFixture<CitySearchComponent>;
  let component: CitySearchComponent;
  let api: jasmine.SpyObj<AlertsApiService>;

  beforeEach(() => {
    api = jasmine.createSpyObj<AlertsApiService>('AlertsApiService', ['searchCities']);
    api.searchCities.and.returnValue(of({ items: [BH, BETIM], page: 1, pageSize: 8, total: 2 }));

    TestBed.configureTestingModule({
      declarations: [CitySearchComponent],
      imports: [ReactiveFormsModule],
      providers: [{ provide: AlertsApiService, useValue: api }],
    });
    fixture = TestBed.createComponent(CitySearchComponent);
    component = fixture.componentInstance;
  });

  it('não busca com menos de 2 letras e sem estado', fakeAsync(() => {
    fixture.detectChanges();
    component.term.setValue('b');
    tick(300);

    expect(api.searchCities).not.toHaveBeenCalled();
    expect(component.searchState.kind).toBe('idle');
  }));

  it('busca com debounce depois de 2 letras', fakeAsync(() => {
    fixture.detectChanges();
    component.term.setValue('be');
    component.term.setValue('bel');
    component.term.setValue('belo');
    tick(300);

    expect(api.searchCities).toHaveBeenCalledTimes(1);
    expect(api.searchCities).toHaveBeenCalledWith({ search: 'belo', state: '', pageSize: 8 });
    expect(component.cities).toEqual([BH, BETIM]);
  }));

  it('busca só pelo estado, mesmo sem texto', fakeAsync(() => {
    fixture.detectChanges();
    component.state.setValue('MG');
    tick(300);

    expect(api.searchCities).toHaveBeenCalledWith({ search: '', state: 'MG', pageSize: 8 });
  }));

  it('mostra erro quando a busca falha', fakeAsync(() => {
    fixture.detectChanges();
    api.searchCities.and.returnValue(throwError(() => new Error('falhou')));
    component.term.setValue('belo');
    tick(300);

    expect(component.searchState.kind).toBe('error');
  }));

  it('emite a cidade escolhida e fecha a lista', fakeAsync(() => {
    fixture.detectChanges();
    const emitted: City[] = [];
    component.citySelected.subscribe((c) => emitted.push(c));
    component.term.setValue('belo');
    tick(300);
    component.open = true;

    component.select(BETIM);

    expect(emitted).toEqual([BETIM]);
    expect(component.open).toBeFalse();
    expect(component.term.value).toBe('Betim - MG');
  }));

  it('navega pela lista com o teclado e seleciona com Enter', fakeAsync(() => {
    fixture.detectChanges();
    const emitted: City[] = [];
    component.citySelected.subscribe((c) => emitted.push(c));
    component.term.setValue('be');
    tick(300);

    const key = (k: string) => component.onKeydown(new KeyboardEvent('keydown', { key: k }));
    key('ArrowDown');
    key('ArrowDown');
    key('Enter');

    expect(emitted).toEqual([BETIM]);
  }));

  it('exibe o nome da cidade atual sem disparar busca', fakeAsync(() => {
    component.currentCity = BH;
    fixture.detectChanges();
    tick(300);

    expect(component.term.value).toBe('Belo Horizonte - MG');
    expect(api.searchCities).not.toHaveBeenCalled();
    expect(component.showList).toBeFalse();
  }));
});
