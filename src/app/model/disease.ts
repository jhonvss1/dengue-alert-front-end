export type Disease = 'dengue' | 'chikungunya' | 'zika';

export const DISEASES: { value: Disease; label: string }[] = [
  { value: 'dengue', label: 'Dengue' },
  { value: 'chikungunya', label: 'Chikungunya' },
  { value: 'zika', label: 'Zika' },
];

export function isDisease(value: unknown): value is Disease {
  return DISEASES.some((d) => d.value === value);
}

export function diseaseLabel(disease: Disease): string {
  return DISEASES.find((d) => d.value === disease)?.label ?? disease;
}
