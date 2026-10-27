import { City } from './city';
import { Disease } from './disease';

export interface Alert {
  disease: Disease;
  year: number;
  week: number;
  weekStart: string | null;
  estimatedCases: number;
  reportedCases: number;
  incidencePer100k: number | null;
  alertLevel: number;
  updatedAt: string;
}

export interface CityAlerts {
  city: City;
  lastSyncedAt: string | null;
  /** Verdadeiro quando a atualização da fonte falhou e os dados são os últimos salvos. */
  isStale: boolean;
  alerts: Alert[];
}
