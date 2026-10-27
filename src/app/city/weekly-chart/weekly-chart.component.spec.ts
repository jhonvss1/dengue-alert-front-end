import { CommonModule } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { alert } from '../testing';
import { WeeklyChartComponent } from './weekly-chart.component';

describe('WeeklyChartComponent', () => {
  let fixture: ComponentFixture<WeeklyChartComponent>;
  let component: WeeklyChartComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({ declarations: [WeeklyChartComponent], imports: [CommonModule] });
    fixture = TestBed.createComponent(WeeklyChartComponent);
    component = fixture.componentInstance;
  });

  it('ordena por semana e escala as barras pelo maior valor', () => {
    component.alerts = [alert('dengue', 2025, 2, 50, 2), alert('dengue', 2024, 52, 100, 1), alert('dengue', 2025, 1, 0, 1)];
    fixture.detectChanges();

    expect(component.bars.map((b) => b.week)).toEqual([52, 1, 2]);
    expect(component.bars.map((b) => b.heightPercent)).toEqual([100, 2, 50]);
    expect(component.bars[2].cssClass).toBe('level-yellow');
    expect(fixture.nativeElement.querySelectorAll('.bar').length).toBe(3);
  });

  it('não desenha nada sem dados', () => {
    component.alerts = [];
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('figure')).toBeNull();
    expect(component.summary).toBe('Sem dados.');
  });

  it('rotula só algumas semanas quando a série é longa, sempre incluindo a última', () => {
    component.alerts = Array.from({ length: 52 }, (_, i) => alert('dengue', 2025, i + 1, i + 1));

    const labelled = component.bars.filter((b) => b.showLabel).length;
    expect(labelled).toBeLessThan(20);
    expect(component.bars[51].showLabel).toBeTrue();
  });
});
