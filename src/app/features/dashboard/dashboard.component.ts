import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { KpiSummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="dashboard">
    <form [formGroup]="filters" class="filters">
      <input type="date" formControlName="from">
      <input type="date" formControlName="to">
      <select formControlName="channel">
        <option value="all">All Channels</option>
        <option value="facebook">Facebook</option>
        <option value="google">Google</option>
      </select>
    </form>
    <div class="kpi-grid">
      <div class="kpi-card"><h3>Views</h3><strong>{{kpi.views}}</strong></div>
      <div class="kpi-card"><h3>Messages</h3><strong>{{kpi.messages}}</strong></div>
      <div class="kpi-card"><h3>Conversions</h3><strong>{{kpi.conversions}}</strong></div>
      <div class="kpi-card"><h3>CTR</h3><strong>{{kpi.ctr}}%</strong></div>
    </div>
    <div class="chart-placeholder">Charts appear here</div>
  </section>
  `,
  styles: [`.filters{display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem}
  .kpi-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}
  .kpi-card{border:1px solid #e5e7eb;border-radius:.5rem;padding:.75rem}
  .chart-placeholder{height:260px;border:1px dashed #e5e7eb;border-radius:.5rem;margin-top:1rem;display:flex;align-items:center;justify-content:center;color:#6b7280}
  @media(max-width:900px){.kpi-grid{grid-template-columns:repeat(2,1fr)}}
  @media(max-width:520px){.kpi-grid{grid-template-columns:1fr}}`]
})
export class DashboardComponent {
  filters = this.fb.group({ from: [''], to: [''], channel: ['all'] });
  kpi: KpiSummary = { views: 0, messages: 0, conversions: 0, ctr: 0 };
  constructor(private fb: FormBuilder){}
}
