import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { alert } from '../testing';
import { AlertSummaryComponent } from './alert-summary.component';

describe('AlertSummaryComponent', () => {
  let fixture: ComponentFixture<AlertSummaryComponent>;
  let component: AlertSummaryComponent;
  let element: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [AlertSummaryComponent], imports: [CommonModule] });
    fixture = TestBed.createComponent(AlertSummaryComponent);
    component = fixture.componentInstance;
    element = fixture.nativeElement;
  });

  it('destaca a semana mais recente de cada doença, inclusive na virada do ano', () => {
    component.alerts = [
      alert('dengue', 2024, 52, 10),
      alert('dengue', 2025, 1, 20, 2),
      alert('zika', 2025, 3, 5),
    ];
    fixture.detectChanges();

    const dengue = component.items.find((i) => i.disease === 'dengue')!;
    expect(dengue.alert?.week).toBe(1);
    expect(dengue.alert?.year).toBe(2025);
    expect(component.items.find((i) => i.disease === 'chikungunya')!.alert).toBeNull();
  });

  it('mostra uma carta por doença e aviso quando não há dados', () => {
    component.alerts = [alert('dengue', 2025, 10, 100, 3)];
    fixture.detectChanges();

    const cards = element.querySelectorAll('button.card');
    expect(cards.length).toBe(3);
    expect(cards[0].classList).toContain('level-orange');
    expect(cards[0].textContent).toContain('Alto');
    expect(cards[1].textContent).toContain('Sem dados no período');
  });

  it('marca a doença selecionada e emite a troca', () => {
    component.alerts = [alert('dengue', 2025, 10, 1)];
    component.selected = 'zika';
    const emitted: string[] = [];
    component.selectedChange.subscribe((d) => emitted.push(d));
    fixture.detectChanges();

    const cards = element.querySelectorAll<HTMLButtonElement>('button.card');
    expect(cards[2].getAttribute('aria-pressed')).toBe('true');
    expect(cards[0].getAttribute('aria-pressed')).toBe('false');

    cards[1].click();
    expect(emitted).toEqual(['chikungunya']);
  });
});
