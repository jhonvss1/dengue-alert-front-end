import { weekRangeLabel } from './week-label';

describe('weekRangeLabel', () => {
  it('mostra de domingo a sábado', () => {
    expect(weekRangeLabel('2025-03-02')).toBe('02/03 a 08/03');
  });

  it('atravessa o fim do mês e do ano', () => {
    expect(weekRangeLabel('2025-12-28')).toBe('28/12 a 03/01');
    expect(weekRangeLabel('2025-02-23')).toBe('23/02 a 01/03');
  });

  it('retorna vazio sem data', () => {
    expect(weekRangeLabel(null)).toBe('');
  });
});
