import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LucideAngularModule, Crown, Calendar, AlertCircle, CheckCircle } from 'lucide-angular';
import { SubscriptionStatus } from '../../../../models/auth.models';

@Component({
  selector: 'app-subscription-status',
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
  templateUrl: './subscription-status.component.html',
  styleUrls: ['./subscription-status.component.scss']
})
export class SubscriptionStatusComponent {
  @Input() subscriptionStatus: SubscriptionStatus | null = null;

  getStatusColor(): string {
    if (!this.subscriptionStatus) return 'default';
    if (this.subscriptionStatus.hasActive) return 'success';
    if (this.subscriptionStatus.daysRemaining <= 7) return 'warning';
    return 'error';
  }

  getStatusText(): string {
    if (!this.subscriptionStatus) return 'غير مشترك';
    if (this.subscriptionStatus.hasActive) return 'نشط';
    if (this.subscriptionStatus.daysRemaining <= 7) return 'ينتهي قريباً';
    return 'منتهي الصلاحية';
  }

  getStatusIcon(): string {
    if (!this.subscriptionStatus) return 'x-circle';
    if (this.subscriptionStatus.hasActive) return 'check-circle';
    if (this.subscriptionStatus.daysRemaining <= 7) return 'alert-circle';
    return 'x-circle';
  }

  getProgressValue(): number {
    if (!this.subscriptionStatus || !this.subscriptionStatus.hasActive) return 0;
    // Assuming 30 days subscription period
    const totalDays = 30;
    const remainingDays = this.subscriptionStatus.daysRemaining;
    return Math.round(((totalDays - remainingDays) / totalDays) * 100);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
