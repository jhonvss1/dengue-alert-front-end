import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Alert } from 'src/app/model/alert';
import { alertLevelInfo } from 'src/app/model/alert-level';
import { Disease, DISEASES } from 'src/app/model/disease';
import { weekRangeLabel } from 'src/app/utils/week-label';

interface SummaryItem {
  disease: Disease;
  label: string;
  alert: Alert | null;
}

@Component({
  selector: 'app-alert-summary',
  templateUrl: './alert-summary.component.html',
  styleUrls: ['./alert-summary.component.css'],
})
export class AlertSummaryComponent {
  @Input() selected: Disease = 'dengue';
  @Output() selectedChange = new EventEmitter<Disease>();

  items: SummaryItem[] = this.build([]);

  /** Recebe a série completa e destaca a semana mais recente de cada doença. */
  @Input() set alerts(alerts: Alert[]) {
    this.items = this.build(alerts ?? []);
  }

  readonly levelInfo = alertLevelInfo;
  readonly rangeLabel = weekRangeLabel;

  private build(alerts: Alert[]): SummaryItem[] {
    return DISEASES.map(({ value, label }) => ({
      disease: value,
      label,
      alert: alerts
        .filter((a) => a.disease === value)
        .reduce<Alert | null>(
          (latest, a) => (!latest || a.year * 100 + a.week > latest.year * 100 + latest.week ? a : latest),
          null,
        ),
    }));
  }
}
