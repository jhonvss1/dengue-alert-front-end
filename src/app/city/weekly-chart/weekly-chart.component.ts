import { Component, Input } from '@angular/core';
import { Alert } from 'src/app/model/alert';
import { alertLevelInfo } from 'src/app/model/alert-level';

interface Bar {
  week: number;
  heightPercent: number;
  cssClass: string;
  tooltip: string;
  showLabel: boolean;
}

@Component({
  selector: 'app-weekly-chart',
  templateUrl: './weekly-chart.component.html',
  styleUrls: ['./weekly-chart.component.css'],
})
export class WeeklyChartComponent {
  bars: Bar[] = [];
  max = 0;
  summary = '';

  /** Série de uma única doença, em qualquer ordem. */
  @Input() set alerts(alerts: Alert[]) {
    const ordered = [...(alerts ?? [])].sort((a, b) => a.year * 100 + a.week - (b.year * 100 + b.week));
    this.max = Math.max(0, ...ordered.map((a) => a.estimatedCases));

    // Com muitas semanas, rotula só uma a cada N para não sobrepor.
    const step = Math.ceil(ordered.length / 13) || 1;
    this.bars = ordered.map((a, index) => ({
      week: a.week,
      heightPercent: this.max > 0 ? Math.max(2, (a.estimatedCases / this.max) * 100) : 2,
      cssClass: alertLevelInfo(a.alertLevel).cssClass,
      tooltip: `Semana ${a.week}/${a.year}: ${Math.round(a.estimatedCases)} casos estimados (${alertLevelInfo(a.alertLevel).label})`,
      showLabel: index % step === 0 || index === ordered.length - 1,
    }));

    this.summary = ordered.length
      ? `Casos estimados por semana, de ${ordered[0].week}/${ordered[0].year} a ${ordered[ordered.length - 1].week}/${ordered[ordered.length - 1].year}. Máximo: ${Math.round(this.max)}.`
      : 'Sem dados.';
  }
}
