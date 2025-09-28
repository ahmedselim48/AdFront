import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LucideAngularModule, Bell, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-angular';
import { NotificationDto } from '../../../../models/notifications.models';

@Component({
  selector: 'app-notifications-widget',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    LucideAngularModule
  ],
  templateUrl: './notifications-widget.component.html',
  styleUrls: ['./notifications-widget.component.scss']
})
export class NotificationsWidgetComponent {
  @Input() notifications: NotificationDto[] = [];
  @Input() isLoading = false;

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'AdPublished': return 'check-circle';
      case 'AdExpired': return 'clock';
      case 'ABTestingResult': return 'bar-chart-3';
      case 'NewMessage': return 'message-square';
      case 'ContactRequest': return 'user';
      case 'CheaperCompetitorFound': return 'trending-down';
      case 'CompetitionReportReady': return 'file-text';
      case 'SuspiciousLoginAttempt': return 'shield-alert';
      case 'PaymentStatus': return 'credit-card';
      case 'SubscriptionExpiringSoon': return 'alert-circle';
      case 'WeeklyPerformanceSummary': return 'bar-chart-3';
      default: return 'bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type) {
      case 'AdPublished': return 'success';
      case 'AdExpired': return 'warning';
      case 'ABTestingResult': return 'info';
      case 'NewMessage': return 'primary';
      case 'ContactRequest': return 'accent';
      case 'CheaperCompetitorFound': return 'warn';
      case 'CompetitionReportReady': return 'info';
      case 'SuspiciousLoginAttempt': return 'error';
      case 'PaymentStatus': return 'success';
      case 'SubscriptionExpiringSoon': return 'warning';
      case 'WeeklyPerformanceSummary': return 'info';
      default: return 'default';
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
