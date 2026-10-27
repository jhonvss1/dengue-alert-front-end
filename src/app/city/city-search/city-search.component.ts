import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import {
  catchError, combineLatest, debounceTime, distinctUntilChanged, map, of, startWith, Subscription, switchMap, tap,
} from 'rxjs';
import { City } from 'src/app/model/city';
import { STATES } from 'src/app/model/states';
import { AlertsApiService } from 'src/app/services/alerts-api.service';

type SearchState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'results'; cities: City[]; total: number }
  | { kind: 'error' };

const MIN_SEARCH_LENGTH = 2;
const MAX_RESULTS = 8;

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.css'],
})
export class CitySearchComponent implements OnInit, OnDestroy {
  readonly states = STATES;
  readonly term = new FormControl('', { nonNullable: true });
  readonly state = new FormControl('', { nonNullable: true });

  searchState: SearchState = { kind: 'idle' };
  open = false;
  activeIndex = -1;

  @Output() citySelected = new EventEmitter<City>();

  /** Cidade atualmente exibida: o nome vai para o campo sem disparar uma nova busca. */
  @Input() set currentCity(city: City | null) {
    this.showText(city ? `${city.name} - ${city.state}` : '');
    this.searchState = { kind: 'idle' };
  }

  private subscription?: Subscription;
  /** Texto que o próprio componente colocou no campo (cidade escolhida): não deve virar uma busca. */
  private displayText = '';

  constructor(private api: AlertsApiService) {}

  ngOnInit(): void {
    const term$ = this.term.valueChanges.pipe(
      startWith(this.term.value),
      map((value) => value.trim()),
      debounceTime(250),
      distinctUntilChanged(),
    );
    const state$ = this.state.valueChanges.pipe(startWith(this.state.value));

    this.subscription = combineLatest([term$, state$])
      .pipe(
        switchMap(([term, state]) => {
          if ((term !== '' && term === this.displayText) || (term.length < MIN_SEARCH_LENGTH && !state)) {
            return of<SearchState>({ kind: 'idle' });
          }

          this.searchState = { kind: 'loading' };
          return this.api.searchCities({ search: term, state, pageSize: MAX_RESULTS }).pipe(
            map((page): SearchState => ({ kind: 'results', cities: page.items, total: page.total })),
            catchError(() => of<SearchState>({ kind: 'error' })),
          );
        }),
        tap(() => (this.activeIndex = -1)),
      )
      .subscribe((searchState) => (this.searchState = searchState));
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  get cities(): City[] {
    return this.searchState.kind === 'results' ? this.searchState.cities : [];
  }

  get showList(): boolean {
    return this.open && this.searchState.kind !== 'idle';
  }

  select(city: City): void {
    this.showText(`${city.name} - ${city.state}`);
    this.open = false;
    this.searchState = { kind: 'idle' };
    this.citySelected.emit(city);
  }

  onKeydown(event: KeyboardEvent): void {
    const count = this.cities.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.open = true;
        if (count) this.activeIndex = (this.activeIndex + 1) % count;
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (count) this.activeIndex = (this.activeIndex - 1 + count) % count;
        break;
      case 'Enter':
        if (this.open && this.activeIndex >= 0 && this.cities[this.activeIndex]) {
          event.preventDefault();
          this.select(this.cities[this.activeIndex]);
        }
        break;
      case 'Escape':
        this.open = false;
        break;
    }
  }

  private showText(text: string): void {
    this.displayText = text;
    this.term.setValue(text, { emitEvent: false });
  }

  trackByGeocode(_: number, city: City): number {
    return city.geocode;
  }
}
