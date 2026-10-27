import { alertLevelInfo } from './alert-level';

describe('alertLevelInfo', () => {
  it('mapeia os níveis 1 a 4', () => {
    expect(alertLevelInfo(1)).toEqual({ label: 'Baixo', cssClass: 'level-green' });
    expect(alertLevelInfo(4).cssClass).toBe('level-red');
  });

  it('usa um nível neutro para valores desconhecidos', () => {
    expect(alertLevelInfo(0).cssClass).toBe('level-gray');
    expect(alertLevelInfo(99).label).toBe('Sem classificação');
  });
});
