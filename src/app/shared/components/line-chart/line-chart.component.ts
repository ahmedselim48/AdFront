import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';

export interface LineSeries { label: string; values: number[]; color?: string; }

@Component({
  selector: 'app-line-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss']
})
export class LineChartComponent {
  @Input() labels: (string | number | Date)[] = [];
  @Input() series: LineSeries[] = [];
  @Input() height = 240;

  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  hoveredIndex: number | null = null;

  get width(): number { return this.svgRef?.nativeElement.clientWidth || 600; }
  get maxY(): number {
    const all = this.series.flatMap(s => s.values);
    const m = Math.max(1, ...all);
    return Math.ceil(m * 1.1);
  }

  x(i: number, len = this.labels.length): number {
    if (len <= 1) return 0;
    const pad = 32;
    const w = this.width - pad * 2;
    return pad + (i * (w / (len - 1)));
  }

  y(v: number): number {
    const padT = 16; const padB = 24;
    const h = this.height - padT - padB;
    const ratio = v / this.maxY;
    return padT + (h - h * ratio);
  }

  pathFor(values: number[]): string {
    if (!values || values.length === 0) return '';
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${this.x(i)} ${this.y(v)}`).join(' ');
  }

  @HostListener('mousemove', ['$event']) onMove(e: MouseEvent){
    const rect = this.svgRef.nativeElement.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pad = 32;
    const w = this.width - pad * 2;
    const len = Math.max(this.labels.length, 1);
    const ratio = Math.max(0, Math.min(1, (x - pad) / w));
    const idx = Math.round(ratio * (len - 1));
    this.hoveredIndex = isNaN(idx) ? null : Math.max(0, Math.min(len - 1, idx));
  }

  @HostListener('mouseleave') onLeave(){ this.hoveredIndex = null; }
}
