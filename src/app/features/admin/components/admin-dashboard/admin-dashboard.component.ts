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
import { AdminService } from '../../../../core/services/admin.service';
import { StatisticsService, AdminStatisticsDto, DashboardStatsDto, GeneralResponse } from '../../../../core/services/statistics.service';

interface DashboardStats {
  totalUsers: number;
  totalAds: number;
  totalCategories: number;
  totalSubscriptions: number;
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
    totalSubscriptions: 0,
    pendingAds: 0,
    activeAds: 0,
    newUsersThisMonth: 0,
    totalViews: 0,
    totalLikes: 0,
    monthlyGrowth: 0
  };

  monthlyData: MonthlyData[] = [];
  progressGoals: ProgressGoal[] = [
    { title: 'زيادة العملاء', current: 0, target: 100, color: 'primary', icon: 'group' },
    { title: 'زيادة الاشتراكات', current: 0, target: 100, color: 'accent', icon: 'workspace_premium' },
    { title: 'عدد الإعلانات', current: 0, target: 100, color: 'warn', icon: 'campaign' }
  ];

  constructor(
    private adminService: AdminService,
    private statisticsService: StatisticsService
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
      dashboardStats: this.statisticsService.getDashboardStats()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.processStatsData(data);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }

  private processStatsData(data: { stats?: GeneralResponse<AdminStatisticsDto>; dashboardStats?: GeneralResponse<DashboardStatsDto>; }): void {
    // بيانات الإحصائيات الأساسية
    if (data.stats?.data) {
      const statsData = data.stats.data;
      this.stats = {
        totalUsers: (statsData as any).totalUsers ?? 0,
        totalAds: (statsData as any).totalAds ?? 0,
        totalCategories: (data.dashboardStats?.data as any)?.totalCategories ?? 0,
        totalSubscriptions: (statsData as any).totalSubscriptions ?? 0,
        pendingAds: (statsData as any).totalPendingAds ?? (statsData as any).pendingAds ?? 0,
        activeAds: (statsData as any).totalAcceptedAds ?? (statsData as any).activeAds ?? 0,
        newUsersThisMonth: (statsData as any).newUsersThisMonth ?? 0,
        totalViews: (statsData as any).totalViews ?? 0,
        totalLikes: (statsData as any).totalLikes ?? 0,
        monthlyGrowth: (statsData as any).monthlyGrowth ?? 0
      };

      // إذا لم تتوفر totalViews ضمن إحصائيات الأدمن، اجلبها من تحليلات الفئات
      if (!this.stats.totalViews) {
        this.adminService.getDashboardCategoryAnalytics().pipe(takeUntil(this.destroy$)).subscribe({
          next: (resp: any) => {
            const tv = Number(resp?.data?.totalViews ?? resp?.data?.TotalViews ?? 0);
            this.stats.totalViews = isFinite(tv) ? tv : 0;
            this.updateProgressGoals();
          },
          error: () => {}
        });
      }

      // ابنِ بيانات المخطط الشهري من monthlyEarnings (إن وُجدت)
      const earnings = (statsData as any).monthlyEarnings || {};

      // مُحوِّل مفاتيح الأشهر (EN/أرقام/عربية) إلى رقم شهر 1..12
      const keyToMonthNumber = (k: string): number | null => {
        const n = Number(k);
        if (!Number.isNaN(n) && n >= 1 && n <= 12) return n;
        const m = k.toLowerCase();
        const map: Record<string, number> = {
          jan:1,feb:2,mar:3,apr:4,may:5,jun:6,jul:7,aug:8,sep:9,oct:10,nov:11,dec:12,
          'يناير':1,'فبراير':2,'مارس':3,'أبريل':4,'مايو':5,'يونيو':6,'يوليو':7,'أغسطس':8,'سبتمبر':9,'أكتوبر':10,'نوفمبر':11,'ديسمبر':12
        };
        // YYYY-MM or YYYY/M
        const yyyymm = /^(\d{4})[-\/.](\d{1,2})$/;
        const mmMatch = k.match(yyyymm);
        if (mmMatch) {
          const mm = Number(mmMatch[2]);
          if (!Number.isNaN(mm) && mm>=1 && mm<=12) return mm;
        }
        // Formats like "Sep 2025" or "September 2025"
        const first3 = m.slice(0,3);
        if (map[first3]) return map[first3];
        if (map[k]) return map[k];
        return null;
      };

      // مُولِّد اسم شهر هجري باستخدام تقويم Islamic عبر Intl
      const hijriName = (gMonthIndex0: number): string => {
        const formatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', { month: 'long' });
        // نستخدم اليوم الأول من الشهر الميلادي للحصول على الاسم الهجري المقابل
        return formatter.format(new Date(new Date().getFullYear(), gMonthIndex0, 1));
      };

      // جدولة القيم لكل 12 شهرًا وفقًا للترتيب الميلادي، مع عرض الأسماء بالهجري
      this.monthlyData = Array.from({ length: 12 }, (_, i) => {
        // ابحث عن قيمة هذا الشهر من earnings بغض النظر عن شكل المفتاح
        let value = 0;
        for (const k of Object.keys(earnings)) {
          const num = keyToMonthNumber(k);
          if (num && num === i + 1) {
            value = Number(earnings[k] ?? 0);
            break;
          }
        }
        return {
          month: hijriName(i),
          users: 0,
          ads: 0,
          views: Math.round(value / 10)
        } as MonthlyData;
      });

      // في حال لا توجد أرباح على الإطلاق، اعرض بيانات معقولة مما هو متاح (حتى لا يكون المخطط صفراً دائماً)
      const anyViews = this.monthlyData.some(m => m.views > 0);
      if (!anyViews) {
        const now = new Date();
        const idx = now.getMonth();
        this.monthlyData = Array.from({ length: 12 }, (_, i) => ({
          month: hijriName(i),
          users: i === idx ? ((statsData as any).totalUsers ?? 0) : 0,
          ads: i === idx ? ((statsData as any).totalAds ?? 0) : 0,
          views: i === idx ? (((statsData as any).totalAds ?? 0) * 10) : 0
        }));
      }
    }

    // تحديث أهداف التقدم بناءً على البيانات الفعلية
    this.updateProgressGoals();
  }

  private updateProgressGoals(): void {
    // اربط الأهداف بالقيم الحقيقية
    this.progressGoals[0].current = this.stats.totalUsers;
    this.progressGoals[0].target = Math.max(100, this.stats.totalUsers);

    this.progressGoals[1].current = this.stats.totalSubscriptions;
    this.progressGoals[1].target = Math.max(100, this.stats.totalSubscriptions);

    this.progressGoals[2].current = this.stats.totalAds;
    this.progressGoals[2].target = Math.max(100, this.stats.totalAds);
  }

  private generateMonthlyDataFromApi(monthlyResponse?: GeneralResponse<any>): void {
    if (!monthlyResponse?.data) {
      this.monthlyData = [];
      return;
    }
    const report = monthlyResponse.data;
    // نحاول قراءة أكثر من شكل متاح للبيانات (مرونة مع الباك الحالي)
    const earnings = report.monthlyEarnings || {};
    const newUsersMap = report.monthlyNewUsers || report.monthlyUsers || {};
    const newAdsMap = report.monthlyNewAds || report.monthlyAds || {};
    const viewsMap = report.monthlyViews || {};

    // اجمع مجموعة الشهور من جميع الخرائط المتاحة
    const monthKeys = new Set<string>([
      ...Object.keys(earnings),
      ...Object.keys(newUsersMap),
      ...Object.keys(newAdsMap),
      ...Object.keys(viewsMap)
    ]);

    this.monthlyData = Array.from(monthKeys).map((m) => ({
      month: m,
      users: Number(newUsersMap[m] ?? 0),
      ads: Number(newAdsMap[m] ?? 0),
      // إن لم تتوفر المشاهدات، نحسبها من الأرباح كبديل بصري
      views: Number(viewsMap[m] ?? Math.round((earnings[m] ?? 0) / 10))
    }));

    // ترتيب حسب الشهور إذا كانت أسماء عربية شائعة
    const monthOrder = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
    this.monthlyData.sort((a,b) => monthOrder.indexOf(a.month) - monthOrder.indexOf(b.month));
  }

  getProgressPercentage(current: number, target: number): number {
    return Math.min((current / target) * 100, 100);
  }

  refreshData(): void {
    this.loadDashboardData();
  }
}