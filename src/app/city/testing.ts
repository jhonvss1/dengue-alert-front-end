import { Alert } from 'src/app/model/alert';
import { Disease } from 'src/app/model/disease';

export function alert(disease: Disease, year: number, week: number, estimated: number, level = 1): Alert {
  return {
    disease,
    year,
    week,
    weekStart: null,
    estimatedCases: estimated,
    reportedCases: Math.round(estimated / 2),
    incidencePer100k: 1.5,
    alertLevel: level,
    updatedAt: '2025-03-10T06:00:00Z',
  };
}
