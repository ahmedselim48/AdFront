import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { LucideAngularModule, TrendingUp, TrendingDown, BarChart3, MapPin, Tag, Users, DollarSign, Activity, Lightbulb, Target, RefreshCw, Filter, Search } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { CompetitionService, MarketInsights } from '../../core/services/competition.service';

@Component({
  selector: 'app-market-insights',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    LucideAngularModule
  ],
  template: `
    <div class="market-insights">
      <!-- Header -->
      <div class="insights-header">
        <div class="header-info">
          <h1 class="insights-title">رؤى السوق</h1>
          <p class="insights-description">احصل على تحليل شامل لاتجاهات السوق وتوصيات لتحسين أداء إعلاناتك</p>
        </div>
        <div class="header-actions">
          <button class="action-btn secondary" (click)="refreshInsights()">
            <lucide-icon name="refresh-cw" size="16"></lucide-icon>
            <span>تحديث</span>
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <form [formGroup]="filtersForm" (ngSubmit)="loadInsights()" class="filters-form">
          <div class="filters-grid">
            <mat-form-field appearance="outline">
              <mat-label>الفئة</mat-label>
              <input matInput formControlName="category" placeholder="مثال: إلكترونيات">
              <mat-icon matSuffix>tag</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>الموقع</mat-label>
              <input matInput formControlName="location" placeholder="مثال: الرياض">
              <mat-icon matSuffix>map-pin</mat-icon>
            </mat-form-field>

            <button type="submit" class="action-btn primary">
              <lucide-icon name="search" size="16"></lucide-icon>
              <span>البحث</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>جاري تحليل رؤى السوق...</p>
      </div>

      <!-- Insights Content -->
      <div *ngIf="!isLoading && insights" class="insights-content">
        <!-- Overview -->
        <div class="overview-section">
          <h2 class="section-title">
            <lucide-icon name="bar-chart-3" size="20"></lucide-icon>
            نظرة عامة على السوق
          </h2>
          <div class="overview-grid">
            <div class="overview-card">
              <div class="overview-header">
                <lucide-icon name="users" size="24"></lucide-icon>
                <span>إجمالي الإعلانات</span>
              </div>
              <div class="overview-value">{{ insights.overview.totalAds.toLocaleString('ar-SA') }}</div>
              <div class="overview-description">إعلان نشط في السوق</div>
            </div>

            <div class="overview-card">
              <div class="overview-header">
                <lucide-icon name="dollar-sign" size="24"></lucide-icon>
                <span>متوسط السعر</span>
              </div>
              <div class="overview-value">{{ formatPrice(insights.overview.averagePrice) }}</div>
              <div class="overview-description">متوسط سعر الإعلانات</div>
            </div>

            <div class="overview-card">
              <div class="overview-header">
                <lucide-icon name="activity" size="24"></lucide-icon>
                <span>نشاط السوق</span>
              </div>
              <div class="overview-value">{{ insights.overview.marketActivity }}</div>
              <div class="overview-description">مستوى النشاط الحالي</div>
            </div>
          </div>
        </div>

        <!-- Market Info -->
        <div class="market-info-section">
          <div class="market-info-card">
            <div class="market-header">
              <h3 class="market-title">معلومات السوق</h3>
              <div class="market-meta">
                <span class="meta-item" *ngIf="insights.category">
                  <lucide-icon name="tag" size="16"></lucide-icon>
                  {{ insights.category }}
                </span>
                <span class="meta-item" *ngIf="insights.location">
                  <lucide-icon name="map-pin" size="16"></lucide-icon>
                  {{ insights.location }}
                </span>
                <span class="meta-item">
                  <lucide-icon name="clock" size="16"></lucide-icon>
                  {{ formatDate(insights.generatedAt) }}
                </span>
              </div>
            </div>
            <div class="market-details">
              <div class="detail-item">
                <span class="detail-label">نطاق السعر:</span>
                <span class="detail-value">{{ formatPriceRange(insights.priceRange?.minPrice, insights.priceRange?.maxPrice) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">حالة السوق:</span>
                <span class="detail-value" [class]="getMarketStatusClass(insights.overview.marketActivity)">
                  {{ insights.overview.marketActivity }}
                </span>
              </div>
              <div class="detail-item">
                <span class="detail-label">مصدر البيانات:</span>
                <span class="detail-value source-real">
                  <lucide-icon name="database" size="14"></lucide-icon>
                  قاعدة البيانات الحقيقية
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Recommendations -->
        <div class="recommendations-section">
          <h2 class="section-title">
            <lucide-icon name="lightbulb" size="20"></lucide-icon>
            التوصيات ({{ insights.recommendations.length }} توصية)
          </h2>
          <div class="recommendations-grid">
            <div *ngFor="let recommendation of insights.recommendations; let i = index" 
                 class="recommendation-card">
              <div class="recommendation-number">{{ i + 1 }}</div>
              <div class="recommendation-content">
                <p class="recommendation-text">{{ recommendation }}</p>
                <div class="recommendation-priority" [class]="getPriorityClass(i)">
                  {{ getPriorityText(i) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Market Trends -->
        <div class="trends-section">
          <h2 class="section-title">
            <lucide-icon name="trending-up" size="20"></lucide-icon>
            اتجاهات السوق
          </h2>
          <div class="trends-grid">
            <div class="trend-card positive">
              <div class="trend-header">
                <lucide-icon name="trending-up" size="20"></lucide-icon>
                <span>اتجاه إيجابي</span>
              </div>
              <p class="trend-description">السوق يظهر نمواً إيجابياً في هذا القطاع</p>
            </div>

            <div class="trend-card neutral">
              <div class="trend-header">
                <lucide-icon name="bar-chart-3" size="20"></lucide-icon>
                <span>استقرار</span>
              </div>
              <p class="trend-description">السوق مستقر مع فرص للتحسين</p>
            </div>

            <div class="trend-card opportunity">
              <div class="trend-header">
                <lucide-icon name="target" size="20"></lucide-icon>
                <span>فرصة</span>
              </div>
              <p class="trend-description">هناك فرص متاحة للتميز في السوق</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !insights" class="error-state">
        <lucide-icon name="alert-circle" size="48" class="error-icon"></lucide-icon>
        <h2>لا توجد رؤى متاحة</h2>
        <p>لم يتم العثور على بيانات رؤى السوق</p>
        <button class="action-btn primary" (click)="loadInsights()">
          <lucide-icon name="refresh-cw" size="16"></lucide-icon>
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./market-insights.component.scss']
})
export class MarketInsightsComponent implements OnInit, OnDestroy {
  insights: MarketInsights | null = null;
  isLoading = false;
  filtersForm: FormGroup;

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  constructor() {
    this.filtersForm = this.fb.group({
      category: [''],
      location: ['']
    });
  }

  ngOnInit() {
    this.loadInsights();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInsights() {
    this.isLoading = true;
    const category = this.filtersForm.value.category;
    const location = this.filtersForm.value.location;

    console.log('=== تحميل رؤى السوق ===');
    console.log('الفئة:', category);
    console.log('الموقع:', location);

    this.competitionService.getMarketInsights(category, location)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('استجابة رؤى السوق:', response);
          if (response.success && response.data) {
            this.insights = response.data;
            console.log('✅ تم تحميل رؤى السوق بنجاح:', this.insights);
            
            // عرض معلومات مفصلة
            console.log('📊 إجمالي الإعلانات:', this.insights.overview.totalAds);
            console.log('💰 متوسط السعر:', this.insights.overview.averagePrice);
            console.log('📈 نشاط السوق:', this.insights.overview.marketActivity);
            console.log('💡 عدد التوصيات:', this.insights.recommendations.length);
            
            this.toastr.success('تم تحميل رؤى السوق بنجاح', 'تم');
          } else {
            this.toastr.error(response.message || 'فشل في تحميل رؤى السوق', 'خطأ');
            console.error('❌ خطأ في الاستجابة:', response.message);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ خطأ في تحميل رؤى السوق:', error);
          this.toastr.error('فشل في تحميل رؤى السوق. تأكد من الاتصال بالإنترنت والخادم', 'خطأ');
          this.isLoading = false;
        }
      });
  }

  getPriorityClass(index: number): string {
    if (index < 2) return 'priority-high';
    if (index < 4) return 'priority-medium';
    return 'priority-low';
  }

  getPriorityText(index: number): string {
    if (index < 2) return 'أولوية عالية';
    if (index < 4) return 'أولوية متوسطة';
    return 'أولوية منخفضة';
  }

  refreshInsights() {
    this.loadInsights();
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

  formatPriceRange(minPrice?: number, maxPrice?: number): string {
    if (minPrice && maxPrice) {
      return `${this.formatPrice(minPrice)} - ${this.formatPrice(maxPrice)}`;
    }
    return 'غير محدد';
  }

  getMarketStatusClass(activity: string): string {
    switch (activity.toLowerCase()) {
      case 'high':
      case 'عالٍ':
      case 'نشط':
        return 'status-high';
      case 'medium':
      case 'متوسط':
        return 'status-medium';
      case 'low':
      case 'منخفض':
      case 'هادئ':
        return 'status-low';
      default:
        return 'status-unknown';
    }
  }
}
