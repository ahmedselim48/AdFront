import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-competition',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="comp-wrap">
    <h2>Competition Analysis</h2>
    <form [formGroup]="filters" class="filters">
      <input placeholder="Keyword" formControlName="keyword">
      <select formControlName="industry"><option value="all">All</option><option>Retail</option><option>SaaS</option></select>
    </form>
    <table class="table">
      <thead><tr><th>Competitor</th><th>Ad Count</th><th>Avg CTR</th><th>Actions</th></tr></thead>
      <tbody>
        <tr *ngFor="let r of rows"><td>{{r.name}}</td><td>{{r.count}}</td><td>{{r.ctr}}%</td><td><button (click)="open(r)">Details</button></td></tr>
      </tbody>
    </table>
  </section>
  `,
  styles: [`.filters{display:flex;gap:.5rem;margin-bottom:1rem}
  input,select{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  .table{width:100%;border-collapse:collapse}
  th,td{border:1px solid #e5e7eb;padding:.5rem;text-align:left}
  button{padding:.25rem .5rem;border:1px solid #111827;border-radius:.375rem;background:#111827;color:#fff}`]
})
export class CompetitionComponent {
  filters = this.fb.group({ keyword: [''], industry: ['all'] });
  rows = [{ name: 'Competitor A', count: 12, ctr: 1.8 }, { name: 'Competitor B', count: 8, ctr: 2.1 }];
  constructor(private fb: FormBuilder){}
  open(_row: any){}
}
