export interface AlertLevelInfo {
  label: string;
  cssClass: string;
}

const LEVELS: Record<number, AlertLevelInfo> = {
  1: { label: 'Baixo', cssClass: 'level-green' },
  2: { label: 'Moderado', cssClass: 'level-yellow' },
  3: { label: 'Alto', cssClass: 'level-orange' },
  4: { label: 'Crítico', cssClass: 'level-red' },
};

const UNKNOWN: AlertLevelInfo = { label: 'Sem classificação', cssClass: 'level-gray' };

export function alertLevelInfo(level: number): AlertLevelInfo {
  return LEVELS[level] ?? UNKNOWN;
}
