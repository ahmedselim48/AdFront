import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { KpiSummary } from '../../models/dashboard.models';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { NotificationService } from '../../core/services/notification.service';
import { Observable } from 'rxjs';
import { AppNotification } from '../../models/notifications.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  filters!: FormGroup;
  kpi: KpiSummary = { views: 12540, messages: 812, conversions: 146, ctr: 2.3, alerts: 3 } as KpiSummary;
  labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  series = [120, 180, 140, 220, 260, 200, 280];
  notifications$: Observable<AppNotification[]>;

  constructor(private fb: FormBuilder, notifications: NotificationService){
    this.filters = this.fb.group({ from: [''], to: [''], channel: ['all'] });
    this.notifications$ = notifications.list$;
  }
}
