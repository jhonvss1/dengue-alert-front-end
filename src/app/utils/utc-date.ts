/**
 * Datas sem fuso (ex.: "2025-03-10T06:00:12.123") vêm da API em UTC; sem o sufixo o navegador
 * as interpretaria como horário local.
 */
export function parseUtc(value: string): Date {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/i.test(value);
  return new Date(hasZone ? value : `${value}Z`);
}
