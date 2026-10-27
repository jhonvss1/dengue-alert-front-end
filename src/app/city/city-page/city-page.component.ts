import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, distinctUntilChanged, finalize, map, Observable, Subscription, switchMap, tap } from 'rxjs';
import { Alert, CityAlerts } from 'src/app/model/alert';
import { alertLevelInfo } from 'src/app/model/alert-level';
import { City } from 'src/app/model/city';
import { Disease, DISEASES, diseaseLabel, isDisease } from 'src/app/model/disease';
import { AlertsApiService } from 'src/app/services/alerts-api.service';
import { parseUtc } from 'src/app/utils/utc-date';
import { weekRangeLabel } from 'src/app/utils/week-label';

export const WEEK_OPTIONS = [4, 12, 26, 52];
const DEFAULT_WEEKS = 12;
const DEFAULT_DISEASE: Disease = 'dengue';
const LAST_CITY_KEY = 'dengue-alert:last-geocode';
/** A primeira consulta de uma cidade busca na fonte externa; avisamos o usuário se demorar. */
const SLOW_LOAD_MS = 2500;

type ViewState =
  | { kind: 'empty' }
  | { kind: 'loading' }
  | { kind: 'ready'; data: CityAlerts }
  | { kind: 'error'; message: string };

export function parseWeeks(value: string | null): number {
  const weeks = Number(value);
  return WEEK_OPTIONS.includes(weeks) ? weeks : DEFAULT_WEEKS;
}

export function errorMessage(error: unknown): string {
  const status = error instanceof HttpErrorResponse ? error.status : -1;
  switch (status) {
    case 0:
      return 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.';
    case 404:
      return 'Município não encontrado.';
    case 503:
      return 'A fonte de dados (InfoDengue) está indisponível no momento e esta cidade ainda não tem dados salvos. Tente novamente em instantes.';
    default:
      return 'Ocorreu um erro ao carregar os dados. Tente novamente.';
  }
}

@Component({
  selector: 'app-city-page',
  templateUrl: './city-page.component.html',
  styleUrls: ['./city-page.component.css'],
})
export class CityPageComponent implements OnInit, OnDestroy {
  readonly weekOptions = WEEK_OPTIONS;
  readonly diseases = DISEASES;
  readonly levelInfo = alertLevelInfo;
  readonly rangeLabel = weekRangeLabel;
  readonly diseaseLabel = diseaseLabel;

  state: ViewState = { kind: 'empty' };
  slowLoad = false;
  geocode: number | null = null;
  weeks = DEFAULT_WEEKS;
  disease: Disease = DEFAULT_DISEASE;
  city: City | null = null;

  private subscription = new Subscription();
  private slowTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private api: AlertsApiService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.subscription.add(
      this.route.queryParamMap.subscribe((query) => {
        const disease = query.get('disease');
        this.disease = isDisease(disease) ? disease : DEFAULT_DISEASE;
      }),
    );

    this.subscription.add(
      combineLatest([this.route.paramMap, this.route.queryParamMap])
        .pipe(
          map(([params, query]) => ({
            geocode: Number(params.get('geocode')) || null,
            weeks: parseWeeks(query.get('weeks')),
          })),
          distinctUntilChanged((a, b) => a.geocode === b.geocode && a.weeks === b.weeks),
          tap(({ geocode, weeks }) => this.onRequest(geocode, weeks)),
          switchMap(({ geocode, weeks }) => this.fetch(geocode, weeks)),
        )
        .subscribe((state) => (this.state = state)),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.clearSlowTimer();
  }

  get data(): CityAlerts | null {
    return this.state.kind === 'ready' ? this.state.data : null;
  }

  /** Série da doença selecionada, da semana mais recente para a mais antiga. */
  get selectedAlerts(): Alert[] {
    return (this.data?.alerts ?? [])
      .filter((a) => a.disease === this.disease)
      .sort((a, b) => b.year * 100 + b.week - (a.year * 100 + a.week));
  }

  get lastSyncedAt(): Date | null {
    const value = this.data?.lastSyncedAt;
    return value ? parseUtc(value) : null;
  }

  onCitySelected(city: City): void {
    this.router.navigate(['/cidade', city.geocode], { queryParamsHandling: 'preserve' });
  }

  onDiseaseChange(disease: Disease): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: { disease }, queryParamsHandling: 'merge' });
  }

  onWeeksChange(value: string): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { weeks: parseWeeks(value) },
      queryParamsHandling: 'merge',
    });
  }

  retry(): void {
    if (this.geocode === null) return;
    this.onRequest(this.geocode, this.weeks);
    this.subscription.add(this.fetch(this.geocode, this.weeks).subscribe((state) => (this.state = state)));
  }

  private onRequest(geocode: number | null, weeks: number): void {
    this.weeks = weeks;

    if (geocode === null) {
      const remembered = this.readLastGeocode();
      if (remembered !== null) {
        this.router.navigate(['/cidade', remembered], { queryParamsHandling: 'preserve', replaceUrl: true });
      }
      return;
    }

    if (geocode !== this.geocode) this.city = null;
    this.geocode = geocode;
    this.saveLastGeocode(geocode);
  }

  private fetch(geocode: number | null, weeks: number) {
    return new Observable<ViewState>((subscriber) => {
      if (geocode === null) {
        subscriber.next({ kind: 'empty' });
        subscriber.complete();
        return;
      }

      this.state = { kind: 'loading' };
      this.slowLoad = false;
      this.clearSlowTimer();
      this.slowTimer = setTimeout(() => (this.slowLoad = true), SLOW_LOAD_MS);

      const inner = this.api
        .getAlerts(geocode, { weeks })
        .pipe(finalize(() => this.clearSlowTimer()))
        .subscribe({
          next: (data) => {
            this.city = data.city;
            subscriber.next({ kind: 'ready', data });
            subscriber.complete();
          },
          error: (error) => {
            subscriber.next({ kind: 'error', message: errorMessage(error) });
            subscriber.complete();
          },
        });

      return () => {
        inner.unsubscribe();
        this.clearSlowTimer();
      };
    });
  }

  private clearSlowTimer(): void {
    if (this.slowTimer !== undefined) clearTimeout(this.slowTimer);
    this.slowTimer = undefined;
    this.slowLoad = false;
  }

  private readLastGeocode(): number | null {
    try {
      return Number(localStorage.getItem(LAST_CITY_KEY)) || null;
    } catch {
      return null;
    }
  }

  private saveLastGeocode(geocode: number): void {
    try {
      localStorage.setItem(LAST_CITY_KEY, String(geocode));
    } catch {
      // armazenamento indisponível (modo privado, por exemplo): só deixamos de lembrar a cidade
    }
  }

  trackByWeek(_: number, alert: Alert): string {
    return `${alert.year}-${alert.week}`;
  }
}
