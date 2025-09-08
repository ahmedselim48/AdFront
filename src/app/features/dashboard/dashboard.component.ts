import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { KpiSummary } from '../../models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  filters = this.fb.group({ from: [''], to: [''], channel: ['all'] });
  kpi: KpiSummary = { views: 0, messages: 0, conversions: 0, ctr: 0 };
  constructor(private fb: FormBuilder){}
}
