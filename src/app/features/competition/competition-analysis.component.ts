import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LucideAngularModule, BarChart3, TrendingUp, TrendingDown, Target, DollarSign, Eye, MessageCircle, Heart, Users, Calendar, MapPin, Search, Filter, Download, Share2, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

import { CompetitionService, CompetitionAnalysisDto, CompetitionAnalysisRequest, CompetitorAdDto } from '../../core/services/competition.service';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';

@Component({
  selector: 'app-competition-analysis',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogModule,
    LucideAngularModule
  ],
  template: `
    <div class="competition-analysis">
      <!-- Analysis Request Form -->
      <div *ngIf="!analysis && !isLoading" class="analysis-request">
        <div class="request-header">
          <h1 class="request-title">تحليل المنافسة</h1>
          <p class="request-description">احصل على تحليل شامل لمنافسيك في السوق لتحسين أداء إعلانك</p>
        </div>

        <!-- إعلانات المستخدم -->
        <div class="ads-selection-section" *ngIf="!adsLoading && ads.length > 0">
          <h2 class="section-title">اختر إعلانك المراد تحليله</h2>
          <div class="selection-info" *ngIf="selectedAd">
            <div class="selected-info">
              <lucide-icon name="check-circle" size="16" color="#48bb78"></lucide-icon>
              <span>تم اختيار: <strong>{{ selectedAd.title }}</strong></span>
            </div>
          </div>
          <div class="ads-grid">
            <div *ngFor="let ad of ads" 
                 class="ad-card" 
                 [class.selected]="selectedAd?.id === ad.id"
                 (click)="selectAd(ad)">
              <div class="ad-header">
                <h3 class="ad-title">{{ ad.title }}</h3>
                <div class="ad-price">{{ formatPrice(ad.price) }}</div>
              </div>
              <p class="ad-description">{{ (ad.description || '') | slice:0:100 }}{{ (ad.description || '').length > 100 ? '...' : '' }}</p>
              <div class="ad-meta">
                <span class="ad-location" *ngIf="ad.location">
                  <lucide-icon name="map-pin" size="14"></lucide-icon>
                  {{ ad.location }}
                </span>
                <span class="ad-category">{{ ad.categoryName }}</span>
              </div>
              <div class="ad-stats">
                <span class="stat-item" *ngIf="ad.viewsCount">
                  <lucide-icon name="eye" size="12"></lucide-icon>
                  {{ ad.viewsCount }} مشاهدة
                </span>
                <span class="stat-item" *ngIf="ad.likesCount">
                  <lucide-icon name="heart" size="12"></lucide-icon>
                  {{ ad.likesCount }} إعجاب
                </span>
              </div>
              <div class="selection-indicator" *ngIf="selectedAd?.id === ad.id">
                <lucide-icon name="check-circle" size="20" color="var(--primary-color)"></lucide-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- رسالة عدم وجود إعلانات -->
        <div class="no-ads-message" *ngIf="!adsLoading && ads.length === 0">
          <lucide-icon name="alert-circle" size="48" class="warning-icon"></lucide-icon>
          <h3>لا توجد إعلانات للتحليل</h3>
          <p>يجب أن يكون لديك إعلانات منشورة حتى يمكن تحليلها</p>
          <button class="action-btn primary" (click)="navigateToCreateAd()">
            <lucide-icon name="plus" size="16"></lucide-icon>
         إنشاء إعلان جديد
          </button>
        </div>

        <!-- Loading الإعلانات -->
        <div class="loading-ads" *ngIf="adsLoading">
          <mat-spinner diameter="40"></mat-spinner>
          <p>جاري تحميل إعلاناتك...</p>
        </div>

        <form [formGroup]="analysisForm" (ngSubmit)="startAnalysis()" class="analysis-form" *ngIf="selectedAd">
          <div class="form-grid">

            <mat-form-field appearance="outline">
              <mat-label>الموقع</mat-label>
              <input matInput formControlName="location" placeholder="مثال: الرياض">
              <mat-icon matSuffix>map-pin</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>الحد الأدنى للسعر</mat-label>
              <input matInput type="number" formControlName="minPrice" placeholder="0">
              <span matSuffix>ريال</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>الحد الأقصى للسعر</mat-label>
              <input matInput type="number" formControlName="maxPrice" placeholder="10000">
              <span matSuffix>ريال</span>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>عدد المنافسين</mat-label>
              <mat-select formControlName="maxCompetitors">
                <mat-option value="10">10 منافسين</mat-option>
                <mat-option value="20">20 منافس</mat-option>
                <mat-option value="50">50 منافس</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="form-actions">
            <button type="submit" 
                    class="action-btn primary" 
                    [disabled]="analysisForm.invalid || isAnalyzing">
              <lucide-icon name="search" size="16" *ngIf="!isAnalyzing"></lucide-icon>
              <mat-spinner diameter="20" *ngIf="isAnalyzing"></mat-spinner>
              <span>{{ isAnalyzing ? 'جاري التحليل...' : 'بدء التحليل' }}</span>
            </button>
          </div>
        </form>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>جاري تحليل المنافسة...</p>
        <div class="loading-steps">
          <div class="step" [class.active]="currentStep >= 1">
            <lucide-icon name="search" size="16"></lucide-icon>
            <span>البحث عن المنافسين</span>
          </div>
          <div class="step" [class.active]="currentStep >= 2">
            <lucide-icon name="bar-chart-3" size="16"></lucide-icon>
            <span>تحليل البيانات</span>
          </div>
          <div class="step" [class.active]="currentStep >= 3">
            <lucide-icon name="target" size="16"></lucide-icon>
            <span>إنتاج التوصيات</span>
          </div>
        </div>
      </div>

      <!-- Analysis Results -->
      <div *ngIf="analysis && !isLoading" class="analysis-results">
        <!-- Header -->
        <div class="results-header">
          <div class="header-info">
            <h1 class="results-title">نتائج تحليل المنافسة</h1>
            <p class="results-subtitle">تم تحليل {{ analysis.competitorCount }} منافس في السوق</p>
            <div class="analysis-meta">
              <span class="meta-item">
                <lucide-icon name="calendar" size="16"></lucide-icon>
                {{ formatDate(analysis.createdAt) }}
              </span>
              <span class="meta-item">
                <lucide-icon name="clock" size="16"></lucide-icon>
                {{ analysis.processingTimeSeconds }} ثانية
              </span>
            </div>
          </div>
          <div class="header-actions">
            <button class="action-btn secondary" (click)="refreshAnalysis()">
              <lucide-icon name="refresh-cw" size="16"></lucide-icon>
              <span>تحديث</span>
            </button>
            <button class="action-btn secondary" (click)="shareAnalysis()">
              <lucide-icon name="share-2" size="16"></lucide-icon>
              <span>مشاركة</span>
            </button>
          </div>
        </div>

        <!-- Key Metrics -->
        <div class="metrics-section">
          <h2 class="section-title">المقاييس الرئيسية</h2>
          <div class="metrics-grid">
            <div class="metric-card">
              <div class="metric-header">
                <lucide-icon name="dollar-sign" size="24"></lucide-icon>
                <span>متوسط سعر المنافسين</span>
              </div>
              <div class="metric-value">{{ formatPrice(analysis.averageCompetitorPrice) }}</div>
              <div class="metric-change" [class]="getPriceChangeClass()">
                <lucide-icon [name]="getPriceChangeIcon()" size="16"></lucide-icon>
                {{ formatPercentage(analysis.priceDifferencePercentage) }}
              </div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <lucide-icon name="users" size="24"></lucide-icon>
                <span>عدد المنافسين</span>
              </div>
              <div class="metric-value">{{ analysis.competitorCount }}</div>
              <div class="metric-description">منافس في السوق</div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <lucide-icon name="eye" size="24"></lucide-icon>
                <span>متوسط الصور</span>
              </div>
              <div class="metric-value">{{ analysis.averageImageCount }}</div>
              <div class="metric-description">صورة لكل إعلان</div>
            </div>

            <div class="metric-card">
              <div class="metric-header">
                <lucide-icon name="message-circle" size="24"></lucide-icon>
                <span>متوسط طول الوصف</span>
              </div>
              <div class="metric-value">{{ analysis.averageDescriptionLength }}</div>
              <div class="metric-description">حرف</div>
            </div>
          </div>
        </div>

        <!-- Suggestions -->
        <div class="suggestions-section">
          <h2 class="section-title">التوصيات</h2>
          <div class="suggestions-grid">
            <div class="suggestion-card" *ngIf="analysis.priceSuggestion">
              <div class="suggestion-header">
                <lucide-icon name="dollar-sign" size="20"></lucide-icon>
                <span>توصيات السعر</span>
              </div>
              <p class="suggestion-text">{{ analysis.priceSuggestion }}</p>
            </div>

            <div class="suggestion-card" *ngIf="analysis.descriptionSuggestion">
              <div class="suggestion-header">
                <lucide-icon name="message-circle" size="20"></lucide-icon>
                <span>توصيات الوصف</span>
              </div>
              <p class="suggestion-text">{{ analysis.descriptionSuggestion }}</p>
            </div>

            <div class="suggestion-card" *ngIf="analysis.imageSuggestion">
              <div class="suggestion-header">
                <lucide-icon name="eye" size="20"></lucide-icon>
                <span>توصيات الصور</span>
              </div>
              <p class="suggestion-text">{{ analysis.imageSuggestion }}</p>
            </div>

            <div class="suggestion-card" *ngIf="analysis.generalSuggestion">
              <div class="suggestion-header">
                <lucide-icon name="target" size="20"></lucide-icon>
                <span>توصيات عامة</span>
              </div>
              <p class="suggestion-text">{{ analysis.generalSuggestion }}</p>
            </div>
          </div>
        </div>

        <!-- Competitor Ads -->
        <div class="competitors-section" *ngIf="analysis.competitorAds && analysis.competitorAds.length > 0">
          <h2 class="section-title">إعلانات المنافسين</h2>
          <div class="competitors-grid">
            <div *ngFor="let competitor of analysis.competitorAds" class="competitor-card">
              <div class="competitor-header">
                <h3 class="competitor-title">{{ competitor.title }}</h3>
                <div class="competitor-price">{{ formatPrice(competitor.price) }}</div>
              </div>
              <p class="competitor-description">{{ competitor.description }}</p>
              <div class="competitor-meta">
                <span *ngIf="competitor.location" class="meta-item">
                  <lucide-icon name="map-pin" size="14"></lucide-icon>
                  {{ competitor.location }}
                </span>
                <span class="meta-item">
                  <lucide-icon name="calendar" size="14"></lucide-icon>
                  {{ formatDate(competitor.collectedAt) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="error && !isLoading" class="error-state">
        <lucide-icon name="alert-circle" size="48" class="error-icon"></lucide-icon>
        <h2>حدث خطأ في التحليل</h2>
        <p>{{ error }}</p>
        <button class="action-btn primary" (click)="retryAnalysis()">
          <lucide-icon name="refresh-cw" size="16"></lucide-icon>
          <span>إعادة المحاولة</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./competition-analysis.component.scss']
})
export class CompetitionAnalysisComponent implements OnInit, OnDestroy {
  analysis: CompetitionAnalysisDto | null = null;
  isLoading = false;
  isAnalyzing = false;
  currentStep = 0;
  error: string | null = null;

  ads: AdItem[] = [];
  adsLoading = false;
  
  selectedAd: AdItem | null = null;

  analysisForm: FormGroup;

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private adsService = inject(AdsService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  constructor() {
    this.analysisForm = this.fb.group({
      adId: ['', [Validators.required]],
      location: [''],
      minPrice: [null],
      maxPrice: [null],
      maxCompetitors: [20]
    });
  }

  ngOnInit() {
    this.loadUserAds();
    
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const analysisId = params['id'];
      if (analysisId) {
        this.loadAnalysis(analysisId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserAds() {
    this.adsLoading = true;
    this.adsService.getMyAds('published')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ads: AdItem[]) => {
          this.ads = ads;
          this.adsLoading = false;
        },
        error: (error) => {
          console.error('خطأ في تحميل الإعلانات:', error);
          this.toastr.error('فشل في تحميل إعلاناتك', 'خطأ');
          this.adsLoading = false;
        }
      });
  }

  selectAd(ad: AdItem) {
    this.selectedAd = ad;
    this.analysisForm.patchValue({
      adId: ad.id,
      location: ad.location || ''
    });
  }

  startAnalysis() {
    if (this.analysisForm.invalid || !this.selectedAd) return;

    this.isAnalyzing = true;
    this.currentStep = 0;
    this.error = null;

    const request: CompetitionAnalysisRequest = {
      adId: this.selectedAd.id,
      location: this.selectedAd.location || this.analysisForm.value.location,
      minPrice: this.analysisForm.value.minPrice,
      maxPrice: this.analysisForm.value.maxPrice,
      maxCompetitors: this.analysisForm.value.maxCompetitors || 20
    };

    // Simulate analysis steps
    this.simulateAnalysisSteps();

    console.log('=== بدء تحليل المنافسة ===');
    console.log('الإعلان المختار:', this.selectedAd);
    console.log('البيانات المرسلة للتحليل:', request);
    
    this.competitionService.analyzeCompetition(request)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('=== استجابة API ===', response);
          if (response.success && response.data) {
            this.analysis = response.data;
            console.log('✅ التحليل مكتمل:', this.analysis);
            
            // عرض المعلومات المفصلة
            console.log('📊 عدد المنافسين:', this.analysis.competitorCount);
            console.log('💰 متوسط سعر المنافسين:', this.analysis.averageCompetitorPrice);
            console.log('📈 نسبة فرق السعر:', this.analysis.priceDifferencePercentage);
            console.log('🖼️ متوسط الصور:', this.analysis.averageImageCount);
            console.log('📝 متوسط طول الوصف:', this.analysis.averageDescriptionLength);
            
            this.toastr.success('تم تحليل المنافسة بنجاح! وجدنا ' + this.analysis.competitorCount + ' منافس', 'تم');
            this.router.navigate(['/profile/competition/analysis', response.data.id]);
          } else {
            this.error = response.message || 'فشل في تحليل المنافسة';
            this.toastr.error(this.error, 'خطأ');
            console.error('❌ خطأ في الاستجابة:', this.error);
          }
          this.isAnalyzing = false;
        },
        error: (error) => {
          console.error('❌ خطأ في تحليل المنافسة:', error);
          this.error = 'حدث خطأ في تحليل المنافسة. تأكد من الاتصال بالإنترنت والخادم';
          this.toastr.error(this.error, 'خطأ');
          this.isAnalyzing = false;
        }
      });
  }

  loadAnalysis(analysisId: string) {
    this.isLoading = true;
    this.competitionService.getAnalysisById(analysisId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.analysis = response.data;
          } else {
            this.error = response.message || 'فشل في تحميل التحليل';
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading analysis:', error);
          this.error = 'حدث خطأ في تحميل التحليل';
          this.isLoading = false;
        }
      });
  }

  refreshAnalysis() {
    if (this.analysis) {
      this.loadAnalysis(this.analysis.id);
    }
  }

  retryAnalysis() {
    this.error = null;
    this.startAnalysis();
  }

  shareAnalysis() {
    if (this.analysis) {
      const url = `${window.location.origin}/competition/analysis/${this.analysis.id}`;
      navigator.clipboard.writeText(url).then(() => {
        this.toastr.success('تم نسخ رابط التحليل', 'تم');
      });
    }
  }

  simulateAnalysisSteps() {
    const steps = [
      { step: 1, delay: 1000 },
      { step: 2, delay: 2000 },
      { step: 3, delay: 1500 }
    ];

    let currentIndex = 0;
    const runStep = () => {
      if (currentIndex < steps.length) {
        this.currentStep = steps[currentIndex].step;
        currentIndex++;
        setTimeout(runStep, steps[currentIndex - 1].delay);
      }
    };
    runStep();
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

  navigateToCreateAd() {
    this.router.navigate(['/ads/create']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatPercentage(percentage: number): string {
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(1)}%`;
  }

  getPriceChangeClass(): string {
    if (!this.analysis) return '';
    return this.analysis.priceDifferencePercentage > 0 ? 'positive' : 'negative';
  }

  getPriceChangeIcon(): string {
    if (!this.analysis) return 'trending-up';
    return this.analysis.priceDifferencePercentage > 0 ? 'trending-up' : 'trending-down';
  }
}
