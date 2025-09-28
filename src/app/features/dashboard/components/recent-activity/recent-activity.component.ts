import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Eye, Heart, MessageSquare, Calendar, User, MoreVertical, Edit, Trash2 } from 'lucide-angular';
import { AdDto } from '../../../../models/ads.models';

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './recent-activity.component.html',
  styleUrls: ['./recent-activity.component.scss']
})
export class RecentActivityComponent {
  @Input() recentAds: AdDto[] = [];

  getStatusColor(status: string): string {
    switch (status) {
      case 'Published': return 'success';
      case 'Pending': return 'warning';
      case 'Draft': return 'info';
      case 'Rejected': return 'error';
      case 'Archived': return 'default';
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Published': return 'منشور';
      case 'Pending': return 'في الانتظار';
      case 'Draft': return 'مسودة';
      case 'Rejected': return 'مرفوض';
      case 'Archived': return 'مؤرشف';
      default: return status;
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      month: 'short',
      day: 'numeric'
    });
  }
}
