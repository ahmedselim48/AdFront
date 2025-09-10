import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { KpiSummary } from '../../models/dashboard.models';
import { LineChartComponent } from '../../shared/components/line-chart/line-chart.component';
import { NotificationService } from '../../core/services/notification.service';
import { Observable } from 'rxjs';
import { AppNotification } from '../../models/notifications.models';
import { AnalyticsService } from '../../core/services/analytics.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LineChartComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  filters!: FormGroup;
  kpi!: KpiSummary;
  labels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  series: number[] = [];
  notifications$: Observable<AppNotification[]>;

  constructor(private fb: FormBuilder, notifications: NotificationService, private analytics: AnalyticsService){
    this.filters = this.fb.group({ from: [''], to: [''], channel: ['all'] });
    this.notifications$ = notifications.list$;
    this.load();
  }
  private load(){
    // Mock data for now
    this.kpi = {
      views: 1250,
      messages: 45,
      conversions: 12,
      ctr: 3.2,
      alerts: 3
    };
    this.series = [120, 150, 180, 200, 220, 190, 250];
  }
}
