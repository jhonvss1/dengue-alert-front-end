import { parseUtc } from './utc-date';

describe('parseUtc', () => {
  it('trata datas sem fuso como UTC', () => {
    expect(parseUtc('2025-03-10T06:00:12.123').toISOString()).toBe('2025-03-10T06:00:12.123Z');
  });

  it('respeita datas que já têm fuso', () => {
    expect(parseUtc('2025-03-10T06:00:12Z').toISOString()).toBe('2025-03-10T06:00:12.000Z');
    expect(parseUtc('2025-03-10T03:00:12-03:00').toISOString()).toBe('2025-03-10T06:00:12.000Z');
  });
});
