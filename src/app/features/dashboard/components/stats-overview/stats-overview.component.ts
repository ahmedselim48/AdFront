import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, FileText, Eye, Heart, MessageSquare, Clock, CheckCircle, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-stats-overview',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    LucideAngularModule
  ],
  templateUrl: './stats-overview.component.html',
  styleUrls: ['./stats-overview.component.scss']
})
export class StatsOverviewComponent {
  @Input() totalAds = 0;
  @Input() publishedAds = 0;
  @Input() draftAds = 0;
  @Input() pendingAds = 0;
  @Input() totalViews = 0;
  @Input() totalClicks = 0;
  @Input() totalLikes = 0;

  getPublishedPercentage(): number {
    return this.totalAds > 0 ? Math.round((this.publishedAds / this.totalAds) * 100) : 0;
  }

  getDraftPercentage(): number {
    return this.totalAds > 0 ? Math.round((this.draftAds / this.totalAds) * 100) : 0;
  }

  getPendingPercentage(): number {
    return this.totalAds > 0 ? Math.round((this.pendingAds / this.totalAds) * 100) : 0;
  }

  getCTR(): number {
    return this.totalViews > 0 ? Math.round((this.totalClicks / this.totalViews) * 100) : 0;
  }

  getEngagementRate(): number {
    const totalEngagement = this.totalLikes + this.totalClicks;
    return this.totalViews > 0 ? Math.round((totalEngagement / this.totalViews) * 100) : 0;
  }
}
