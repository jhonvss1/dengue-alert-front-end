/** "2025-03-02" -> "02/03" (sem passar por Date, para não sofrer deslocamento de fuso). */
function dayMonth(isoDate: string): string {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

function addDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d + days));
  return date.toISOString().slice(0, 10);
}

/** Período da semana epidemiológica (domingo a sábado): "02/03 a 08/03". Vazio se a data de início for desconhecida. */
export function weekRangeLabel(weekStart: string | null): string {
  if (!weekStart) return '';
  return `${dayMonth(weekStart)} a ${dayMonth(addDays(weekStart, 6))}`;
}
