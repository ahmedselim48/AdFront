import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { LucideAngularModule, Users, FileText, Eye, Heart, MessageSquare, TrendingUp, Calendar, AlertCircle } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminService } from '../../../../core/services/admin.service';
import { AdminStatisticsDto } from '../../../../models/admin.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatTabsModule,
    LucideAngularModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  // Data
  adminStats: AdminStatisticsDto | null = null;
  dashboardData: any | null = null;
  
  // Loading states
  isLoading = false;
  isLoadingDashboard = false;

  private destroy$ = new Subject<void>();

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadAdminStats();
    this.loadDashboardData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminStats() {
    this.isLoading = true;

    this.adminService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.adminStats = response.data;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error('حدث خطأ أثناء تحميل الإحصائيات', 'خطأ');
        console.error('Error loading admin stats:', error);
      }
    });
  }

  loadDashboardData() {
    this.isLoadingDashboard = true;

    this.adminService.getDashboardStats().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dashboardData = response.data;
        }
        this.isLoadingDashboard = false;
      },
      error: (error) => {
        this.isLoadingDashboard = false;
        console.error('Error loading dashboard data:', error);
      }
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getPercentageChange(current: number, previous: number): number {
    if (previous === 0) return 0;
    return Math.round(((current - previous) / previous) * 100);
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'user_registration': return 'users';
      case 'ad_created': return 'file-text';
      case 'ad_viewed': return 'eye';
      case 'ad_liked': return 'heart';
      case 'comment_added': return 'message-square';
      default: return 'activity';
    }
  }
}
