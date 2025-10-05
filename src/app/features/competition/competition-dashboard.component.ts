import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule, TrendingUp, TrendingDown, Target, DollarSign, Eye, MessageCircle, Heart, BarChart3, Lightbulb, AlertCircle, CheckCircle, Clock, RefreshCw, Home, ChevronRight } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CompetitionService, CompetitionDashboardDto, QuickInsight, ActionItem } from '../../core/services/competition.service';

@Component({
  selector: 'app-competition-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    LucideAngularModule
  ],
  template: `
    <div class="competition-dashboard">
      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>جاري تحميل لوحة تحليل المنافسة...</p>
      </div>

        <!-- Dashboard Content -->
        <div *ngIf="!isLoading && dashboard" class="dashboard-content">
        <!-- Header -->
        <div class="dashboard-header">
          <div class="header-info">
            <div class="breadcrumb">
              <a routerLink="/profile" class="breadcrumb-link">
                <lucide-icon name="home" size="14"></lucide-icon>
                <span>الملف الشخصي</span>
              </a>
              <lucide-icon name="chevron-right" size="14" class="breadcrumb-separator"></lucide-icon>
              <a routerLink="/profile/competition" class="breadcrumb-link">
                <span>تحليل المنافسة</span>
              </a>
              <lucide-icon name="chevron-right" size="14" class="breadcrumb-separator"></lucide-icon>
              <span class="breadcrumb-current">لوحة التحكم</span>
            </div>
            <h1 class="dashboard-title">تحليل المنافسة</h1>
            <p class="dashboard-subtitle">{{ dashboard.adTitle || 'جاري التحميل...' }}</p>
            <div class="last-updated">
              <lucide-icon name="clock" size="16"></lucide-icon>
              <span>آخر تحديث: {{ dashboard ? formatDate(dashboard.lastUpdated) : 'جاري التحميل...' }}</span>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn secondary" routerLink="/profile/competition/analysis" 
                    matTooltip="الذهاب لتحليل مفصل">
              <lucide-icon name="bar-chart-3" size="16"></lucide-icon>
              <span>تحليل مفصل</span>
            </button>
            <button class="action-btn secondary" routerLink="/profile/competition/insights" 
                    matTooltip="عرض رؤى السوق">
              <lucide-icon name="trending-up" size="16"></lucide-icon>
              <span>رؤى السوق</span>
            </button>
            <button class="action-btn primary" (click)="refreshDashboard()" 
                    matTooltip="تحديث البيانات">
              <lucide-icon name="refresh-cw" size="16"></lucide-icon>
              <span>تحديث</span>
            </button>
          </div>
        </div>

        <!-- Key Metrics Cards -->
        <div class="metrics-grid">
          <!-- Market Position -->
          <div class="metric-card" [class]="getMetricCardClass('market-position')" 
               matTooltip="نسبة موقعك في السوق مقارنة بالمنافسين">
            <div class="metric-header">
              <div class="metric-icon">
                <lucide-icon name="target" size="24"></lucide-icon>
              </div>
              <div class="metric-title">الموقع في السوق</div>
            </div>
            <div class="metric-value">{{ dashboard.marketPosition }}%</div>
            <div class="metric-progress">
              <div class="progress-bar" [style.width.%]="dashboard.marketPosition"></div>
            </div>
            <div class="metric-status" [class]="dashboard.marketPositionColor">
              {{ dashboard.marketPositionText }}
            </div>
          </div>

          <!-- Price Analysis -->
          <div class="metric-card" [class]="getMetricCardClass('price')">
            <div class="metric-header">
              <div class="metric-icon">
                <lucide-icon name="dollar-sign" size="24"></lucide-icon>
              </div>
              <div class="metric-title">تحليل السعر</div>
            </div>
            <div class="metric-value">{{ formatPrice(dashboard.userPrice) }}</div>
            <div class="metric-details">
              <span class="market-average">متوسط السوق: {{ formatPrice(dashboard.marketAverage) }}</span>
              <span class="price-difference" [class]="dashboard.priceStatusColor">
                {{ formatPriceDifference(dashboard.priceDifference) }}
              </span>
            </div>
            <div class="metric-status" [class]="dashboard.priceStatusColor">
              {{ dashboard.priceStatusText }}
            </div>
          </div>

          <!-- Content Score -->
          <div class="metric-card" [class]="getMetricCardClass('content')">
            <div class="metric-header">
              <div class="metric-icon">
                <lucide-icon name="eye" size="24"></lucide-icon>
              </div>
              <div class="metric-title">جودة المحتوى</div>
            </div>
            <div class="metric-value">{{ dashboard.contentScore }}%</div>
            <div class="metric-status" [class]="dashboard.contentScoreColor">
              {{ dashboard.contentScoreText }}
            </div>
          </div>

          <!-- Competitor Count -->
          <div class="metric-card" [class]="getMetricCardClass('competitors')">
            <div class="metric-header">
              <div class="metric-icon">
                <lucide-icon name="bar-chart-3" size="24"></lucide-icon>
              </div>
              <div class="metric-title">عدد المنافسين</div>
            </div>
            <div class="metric-value">{{ dashboard.competitorCount }}</div>
            <div class="metric-status">
              {{ dashboard.competitorCountText }}
            </div>
          </div>
        </div>

        <!-- Quick Insights -->
        <div class="insights-section">
          <h2 class="section-title">
            <lucide-icon name="lightbulb" size="20"></lucide-icon>
            رؤى سريعة
          </h2>
          <div class="insights-grid">
            <div *ngFor="let insight of dashboard.quickInsights" 
                 class="insight-card" 
                 [class]="insight.color">
              <div class="insight-icon">{{ insight.icon }}</div>
              <div class="insight-content">
                <h3 class="insight-title">{{ insight.title }}</h3>
                <p class="insight-description">{{ insight.description }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Items -->
        <div class="actions-section">
          <h2 class="section-title">
            <lucide-icon name="target" size="20"></lucide-icon>
            عناصر العمل المقترحة
          </h2>
          <div class="actions-grid">
            <div *ngFor="let action of dashboard.actionItems" 
                 class="action-card" 
                 [class]="getActionPriorityClass(action.priority)">
              <div class="action-header">
                <div class="action-category">{{ action.category }}</div>
                <div class="action-priority" [class]="action.priority.toLowerCase()">
                  {{ getPriorityText(action.priority) }}
                </div>
              </div>
              <h3 class="action-title">{{ action.title }}</h3>
              <p class="action-impact">{{ action.estimatedImpact }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !dashboard" class="error-state">
        <lucide-icon name="alert-circle" size="48" class="error-icon"></lucide-icon>
        
        <!-- حالة عدم وجود adId -->
        <div *ngIf="!adId" class="no-ad-id">
          <h2>اختر إعلاناً للتحليل</h2>
          <p>لم يتم تحديد إعلان لعرض تحليل المنافسة</p>
          <div class="ad-selection-actions">
            <button class="action-btn primary" (click)="navigateToAds()">
              <lucide-icon name="list" size="16"></lucide-icon>
              <span>عرض إعلاناتي</span>
            </button>
            <button class="action-btn secondary" (click)="navigateToCreateAd()">
              <lucide-icon name="plus" size="16"></lucide-icon>
              <span>إنشاء إعلان جديد</span>
            </button>
          </div>
        </div>

        <!-- حالة وجود adId ولكن لا توجد بيانات -->
        <div *ngIf="adId" class="no-data">
          <h2>لا توجد بيانات متاحة</h2>
          <p>لم يتم العثور على تحليل منافسة لهذا الإعلان</p>
          <div class="debug-info">
            <p><strong>معرف الإعلان:</strong> {{ adId }}</p>
            <p><strong>الرابط:</strong> {{ getCurrentUrl() }}</p>
          </div>
          <div class="error-actions">
            <button class="action-btn primary" (click)="refreshDashboard()">
              <lucide-icon name="refresh-cw" size="16"></lucide-icon>
              <span>إعادة المحاولة</span>
            </button>
            <button class="action-btn secondary" (click)="testApiDirectly()">
              <lucide-icon name="test-tube" size="16"></lucide-icon>
              <span>اختبار الـ API مباشرة</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./competition-dashboard.component.scss']
})
export class CompetitionDashboardComponent implements OnInit, OnDestroy {
  dashboard: CompetitionDashboardDto | null = null;
  isLoading = false;
  adId: string | null = null;

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    console.log('=== تهيئة لوحة تحكم المنافسة ===');
    console.log('الرابط الحالي:', window.location.href);
    
    // التحقق من المعاملات في الـ URL سواء كانت params أو queryParams
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      console.log('Route params:', params);
      this.adId = params['adId'];
      if (this.adId) {
        console.log('تم العثور على adId في params:', this.adId);
        this.loadDashboard();
      } else {
        console.log('لا يوجد adId في params');
      }
    });
    
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(queryParams => {
      console.log('Query params:', queryParams);
      if (queryParams['adId'] && !this.adId) {
        this.adId = queryParams['adId'];
        console.log('تم العثور على adId في queryParams:', this.adId);
        this.loadDashboard();
      } else if (!this.adId) {
        console.log('لا يوجد adId في queryParams أيضاً');
        this.showAdSelectionDialog();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard() {
    if (!this.adId) {
      console.error('❌ لا يوجد adId في الـ URL');
      this.toastr.error('معرف الإعلان غير موجود في الرابط', 'خطأ');
      return;
    }

    this.isLoading = true;
    console.log('=== بدء تحميل لوحة التحليل ===');
    console.log('معرف الإعلان:', this.adId);
    console.log('نوع المعرف:', typeof this.adId);
    console.log('الرابط الحالي:', window.location.href);
    
    this.competitionService.getCompetitionDashboard(this.adId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('=== استجابة لوحة التحليل ===');
          console.log('الاستجابة الكاملة:', response);
          console.log('نجح:', response.success);
          console.log('البيانات:', response.data);
          console.log('الرسالة:', response.message);
          
          if (response.success && response.data) {
            this.dashboard = response.data;
            console.log('✅ تم تحميل لوحة التحليل بنجاح:', this.dashboard);
            console.log('عنوان الإعلان:', this.dashboard.adTitle);
            console.log('الموقع في السوق:', this.dashboard.marketPosition);
            console.log('عدد الرؤى:', this.dashboard.quickInsights.length);
            console.log('عدد التوصيات:', this.dashboard.actionItems.length);
            this.toastr.success('تم تحميل لوحة التحليل بنجاح', 'تم');
          } else {
            console.error('❌ فشل في تحميل لوحة التحليل:', response.message);
            this.toastr.error(response.message || 'فشل في تحميل لوحة التحليل', 'خطأ');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('=== خطأ في تحميل لوحة التحليل ===');
          console.error('نوع الخطأ:', error);
          console.error('رسالة الخطأ:', error.message);
          console.error('حالة الخطأ:', error.status);
          console.error('تفاصيل الخطأ:', error.error);
          
          let errorMessage = 'فشل في تحميل لوحة التحليل';
          if (error.status === 404) {
            errorMessage = 'لم يتم العثور على إعلان بهذا المعرف';
          } else if (error.status === 401) {
            errorMessage = 'غير مصرح لك بالوصول لهذا الإعلان';
          } else if (error.status === 0) {
            errorMessage = 'لا يمكن الاتصال بالخادم. تأكد من تشغيل الـ Backend';
          }
          
          this.toastr.error(errorMessage, 'خطأ');
          this.isLoading = false;
        }
      });
  }

  refreshDashboard() {
    this.loadDashboard();
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatPriceDifference(difference: number): string {
    const sign = difference > 0 ? '+' : '';
    return `${sign}${this.formatPrice(difference)}`;
  }

  getMetricCardClass(type: string): string {
    if (!this.dashboard) return '';
    
    switch (type) {
      case 'market-position':
        return this.dashboard.marketPositionColor;
      case 'price':
        return this.dashboard.priceStatusColor;
      case 'content':
        return this.dashboard.contentScoreColor;
      case 'competitors':
        return 'neutral';
      default:
        return '';
    }
  }

  getActionPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }

  getPriorityText(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'عالي';
      case 'medium':
        return 'متوسط';
      case 'low':
        return 'منخفض';
      default:
        return priority;
    }
  }

  getCurrentUrl(): string {
    return window.location.href;
  }

  showAdSelectionDialog() {
    console.log('عرض حوار اختيار الإعلان');
    this.toastr.info('يرجى اختيار إعلان لعرض تحليل المنافسة', 'اختيار الإعلان');
  }

  navigateToAds() {
    this.router.navigate(['/profile/ads']);
  }

  navigateToCreateAd() {
    this.router.navigate(['/profile/ads/create']);
  }

  testApiDirectly() {
    if (!this.adId) {
      this.toastr.error('لا يوجد معرف إعلان للاختبار', 'خطأ');
      return;
    }

    console.log('=== اختبار الـ API مباشرة ===');
    console.log('معرف الإعلان:', this.adId);
    
    // اختبار مباشر للـ API
    const apiUrl = `http://localhost:5254/api/Competition/dashboard/${this.adId}`;
    console.log('رابط الـ API:', apiUrl);
    
    fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    .then(response => {
      console.log('استجابة الـ API:', response);
      console.log('حالة الاستجابة:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('بيانات الـ API:', data);
      this.toastr.success('تم اختبار الـ API بنجاح. راجع الـ Console', 'نجح');
    })
    .catch(error => {
      console.error('خطأ في اختبار الـ API:', error);
      this.toastr.error('فشل في اختبار الـ API. راجع الـ Console', 'خطأ');
    });
  }
}
