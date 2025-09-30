import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil, forkJoin } from 'rxjs';
import { AdminService, AdminStatisticsDto } from '../../../../core/services/admin.service';
import { StatisticsService } from '../../../../core/services/statistics.service';
import { CategoryManagementService } from '../../../../core/services/category-management.service';

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  totalCategories: number;
  pendingAds: number;
  activeAds: number;
  newUsersThisMonth: number;
  totalViews: number;
  totalLikes: number;
  monthlyGrowth: number;
}

interface MonthlyData {
  month: string;
  users: number;
  ads: number;
  views: number;
}

interface ProgressGoal {
  title: string;
  current: number;
  target: number;
  color: string;
  icon: string;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatButtonModule,
    MatTabsModule,
    MatGridListModule,
    MatChipsModule,
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = false;
  stats: DashboardStats = {
    totalUsers: 0,
    totalAds: 0,
    totalCategories: 0,
    pendingAds: 0,
    activeAds: 0,
    newUsersThisMonth: 0,
    totalViews: 0,
    totalLikes: 0,
    monthlyGrowth: 0
  };

  monthlyData: MonthlyData[] = [];
  progressGoals: ProgressGoal[] = [
    {
      title: 'إضافة المنتجات إلى العربة',
      current: 75,
      target: 100,
      color: 'primary',
      icon: 'shopping_cart'
    },
    {
      title: 'إتمام الشراء',
      current: 60,
      target: 100,
      color: 'accent',
      icon: 'payment'
    },
    {
      title: 'زيارة الصفحة المميزة',
      current: 45,
      target: 100,
      color: 'warn',
      icon: 'star'
    },
    {
      title: 'إرسال الاستفسارات',
      current: 80,
      target: 100,
      color: 'primary',
      icon: 'question_answer'
    }
  ];

  constructor(
    private adminService: AdminService,
    private statisticsService: StatisticsService,
    private categoryService: CategoryManagementService
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.loading = true;
    
    forkJoin({
      stats: this.statisticsService.getStatistics(),
      dashboardStats: this.statisticsService.getDashboardStats(),
      categories: this.categoryService.getAllCategories()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.processStatsData(data);
        this.generateMonthlyData();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private processStatsData(data: any): void {
    // معالجة البيانات من الخدمات المختلفة
    if (data.stats?.data) {
      const statsData = data.stats.data;
      this.stats = {
        totalUsers: statsData.totalUsers || 0,
        totalAds: statsData.totalAds || 0,
        totalCategories: statsData.totalCategories || 0,
        pendingAds: statsData.pendingAds || 0,
        activeAds: statsData.activeAds || 0,
        newUsersThisMonth: statsData.newUsersThisMonth || 0,
        totalViews: statsData.totalViews || 0,
        totalLikes: statsData.totalLikes || 0,
        monthlyGrowth: statsData.monthlyGrowth || 0
      };
    }

    // تحديث أهداف التقدم بناءً على البيانات الفعلية
    this.updateProgressGoals();
  }

  private updateProgressGoals(): void {
    this.progressGoals[0].current = Math.min(75, this.stats.totalAds);
    this.progressGoals[1].current = Math.min(60, this.stats.activeAds);
    this.progressGoals[2].current = Math.min(45, Math.floor(this.stats.totalViews / 100));
    this.progressGoals[3].current = Math.min(80, this.stats.newUsersThisMonth);
  }

  private generateMonthlyData(): void {
    // توليد بيانات شهرية وهمية للعرض
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
    this.monthlyData = months.map((month, index) => ({
      month,
      users: Math.floor(Math.random() * 100) + 50,
      ads: Math.floor(Math.random() * 200) + 100,
      views: Math.floor(Math.random() * 1000) + 500
    }));
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}