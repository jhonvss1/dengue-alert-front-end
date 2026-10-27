export interface City {
  geocode: number;
  name: string;
  state: string;
  isTracked: boolean;
  lastSyncedAt: string | null;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
}
