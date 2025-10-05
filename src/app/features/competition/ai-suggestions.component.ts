import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LucideAngularModule, Brain, Lightbulb, Target, TrendingUp, DollarSign, Eye, MessageCircle, Heart, Users, Calendar, RefreshCw, Share2, Download, Copy, CheckCircle, AlertCircle, Clock, Sparkles } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CompetitionService, CompetitionSuggestionsDto, ActionItem } from '../../core/services/competition.service';

@Component({
  selector: 'app-ai-suggestions',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatDialogModule,
    LucideAngularModule
  ],
  template: `
    <div class="ai-suggestions">
      <!-- Header -->
      <div class="suggestions-header">
        <div class="header-info">
          <h1 class="suggestions-title">
            <lucide-icon name="brain" size="24"></lucide-icon>
            اقتراحات الذكاء الاصطناعي
          </h1>
          <p class="suggestions-description">احصل على توصيات ذكية لتحسين أداء إعلانك باستخدام الذكاء الاصطناعي</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" (click)="showDevelopmentMessage()">
            <lucide-icon name="sparkles" size="16"></lucide-icon>
            <span>توليد اقتراحات ذكية</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-container">
        <mat-spinner diameter="50"></mat-spinner>
        <p>جاري تحليل الإعلان وإنتاج الاقتراحات...</p>
        <div class="ai-thinking">
          <div class="thinking-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>الذكاء الاصطناعي يفكر في أفضل الحلول...</p>
        </div>
      </div>

      <!-- Suggestions Content -->
      <div *ngIf="!isLoading && suggestions" class="suggestions-content">
        <!-- Priority & Impact -->
        <div class="priority-section">
          <div class="priority-card">
            <div class="priority-header">
              <lucide-icon name="target" size="20"></lucide-icon>
              <span>الأولوية والتأثير المتوقع</span>
            </div>
            <div class="priority-content">
              <div class="priority-badge" [class]="getPriorityClass(suggestions.priority)">
                {{ getPriorityText(suggestions.priority) }}
              </div>
              <div class="impact-text">{{ suggestions.estimatedImpact }}</div>
            </div>
          </div>
        </div>

        <!-- Price Suggestions -->
        <div class="suggestions-section" *ngIf="suggestions.priceSuggestions && suggestions.priceSuggestions.length > 0">
          <h2 class="section-title">
            <lucide-icon name="dollar-sign" size="20"></lucide-icon>
            اقتراحات السعر
          </h2>
          <div class="suggestions-grid">
            <div *ngFor="let suggestion of suggestions.priceSuggestions" class="suggestion-card price">
              <div class="suggestion-header">
                <lucide-icon name="dollar-sign" size="20"></lucide-icon>
                <span>سعر</span>
              </div>
              <p class="suggestion-text">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- Content Suggestions -->
        <div class="suggestions-section" *ngIf="suggestions.contentSuggestions && suggestions.contentSuggestions.length > 0">
          <h2 class="section-title">
            <lucide-icon name="message-circle" size="20"></lucide-icon>
            اقتراحات المحتوى
          </h2>
          <div class="suggestions-grid">
            <div *ngFor="let suggestion of suggestions.contentSuggestions" class="suggestion-card content">
              <div class="suggestion-header">
                <lucide-icon name="message-circle" size="20"></lucide-icon>
                <span>محتوى</span>
              </div>
              <p class="suggestion-text">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- Image Suggestions -->
        <div class="suggestions-section" *ngIf="suggestions.imageSuggestions && suggestions.imageSuggestions.length > 0">
          <h2 class="section-title">
            <lucide-icon name="eye" size="20"></lucide-icon>
            اقتراحات الصور
          </h2>
          <div class="suggestions-grid">
            <div *ngFor="let suggestion of suggestions.imageSuggestions" class="suggestion-card image">
              <div class="suggestion-header">
                <lucide-icon name="eye" size="20"></lucide-icon>
                <span>صور</span>
              </div>
              <p class="suggestion-text">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- Engagement Suggestions -->
        <div class="suggestions-section" *ngIf="suggestions.engagementSuggestions && suggestions.engagementSuggestions.length > 0">
          <h2 class="section-title">
            <lucide-icon name="heart" size="20"></lucide-icon>
            اقتراحات التفاعل
          </h2>
          <div class="suggestions-grid">
            <div *ngFor="let suggestion of suggestions.engagementSuggestions" class="suggestion-card engagement">
              <div class="suggestion-header">
                <lucide-icon name="heart" size="20"></lucide-icon>
                <span>تفاعل</span>
              </div>
              <p class="suggestion-text">{{ suggestion }}</p>
            </div>
          </div>
        </div>

        <!-- Market Insights -->
        <div class="suggestions-section" *ngIf="suggestions.marketInsights && suggestions.marketInsights.length > 0">
          <h2 class="section-title">
            <lucide-icon name="trending-up" size="20"></lucide-icon>
            رؤى السوق
          </h2>
          <div class="suggestions-grid">
            <div *ngFor="let insight of suggestions.marketInsights" class="suggestion-card market">
              <div class="suggestion-header">
                <lucide-icon name="trending-up" size="20"></lucide-icon>
                <span>سوق</span>
              </div>
              <p class="suggestion-text">{{ insight }}</p>
            </div>
          </div>
        </div>

        <!-- Action Items -->
        <div class="suggestions-section" *ngIf="suggestions.actionItems && suggestions.actionItems.length > 0">
          <h2 class="section-title">
            <lucide-icon name="target" size="20"></lucide-icon>
            عناصر العمل
          </h2>
          <div class="actions-grid">
            <div *ngFor="let action of suggestions.actionItems" class="action-card" [class]="getActionPriorityClass(action.priority)">
              <div class="action-header">
                <div class="action-category">{{ action.category }}</div>
                <div class="action-priority" [class]="action.priority.toLowerCase()">
                  {{ getPriorityText(action.priority) }}
                </div>
              </div>
              <h3 class="action-title">{{ action.title }}</h3>
              <p class="action-description" *ngIf="action.description">{{ action.description }}</p>
              <p class="action-impact">{{ action.estimatedImpact }}</p>
            </div>
          </div>
        </div>

        <!-- Generation Info -->
        <div class="generation-info">
          <div class="info-card">
            <div class="info-header">
              <lucide-icon name="brain" size="20"></lucide-icon>
              <span>معلومات التوليد</span>
            </div>
            <div class="info-content">
              <div class="info-item">
                <span class="info-label">تم التوليد في:</span>
                <span class="info-value">{{ formatDate(suggestions.generatedAt) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">معرف التحليل:</span>
                <span class="info-value">{{ suggestions.analysisId }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div *ngIf="!isLoading && !suggestions" class="error-state">
        <lucide-icon name="alert-circle" size="48" class="error-icon"></lucide-icon>
        <h2>لا توجد اقتراحات متاحة</h2>
        <p>لم يتم العثور على اقتراحات ذكية لهذا الإعلان</p>
        <button class="action-btn primary" (click)="showDevelopmentMessage()">
          <lucide-icon name="sparkles" size="16"></lucide-icon>
          <span>توليد اقتراحات جديدة</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./ai-suggestions.component.scss']
})
export class AISuggestionsComponent implements OnInit, OnDestroy {
  suggestions: CompetitionSuggestionsDto | null = null;
  isLoading = false;
  isGenerating = false;
  adId: string | null = null;

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.adId = params['adId'];
      if (this.adId) {
        this.loadSuggestions();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSuggestions() {
    if (!this.adId) return;

    this.isLoading = true;
    this.competitionService.generateAISuggestions(this.adId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.suggestions = response.data;
          } else {
            this.toastr.error(response.message || 'فشل في تحميل الاقتراحات', 'خطأ');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading AI suggestions:', error);
          this.toastr.error('فشل في تحميل الاقتراحات', 'خطأ');
          this.isLoading = false;
        }
      });
  }

  generateSuggestions() {
    if (!this.adId) return;

    this.isGenerating = true;
    // TODO: يجب ربط API Key أولاً قبل تفعيل هذه الوظيفة
    this.showDevelopmentMessage();
    this.isGenerating = false;
    
    /* تم تعطيل حتى يتم ربط API Key
    this.competitionService.generateAISuggestions(this.adId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.suggestions = response.data;
            this.toastr.success('تم توليد اقتراحات جديدة بنجاح', 'تم');
          } else {
            this.toastr.error(response.message || 'فشل في توليد الاقتراحات', 'خطأ');
          }
          this.isGenerating = false;
        },
       error: (error) => {
          console.error('Error generating AI suggestions:', error);
          this.toastr.error('فشل في توليد الاقتراحات', 'خطأ');
          this.isGenerating = false;
        }
      });
    */
  }

  showDevelopmentMessage() {
    this.toastr.info('وظيفة الاقتراحات الذكية قيد التطوير، ستكون متاحة بعد ربط API Key للذكاء الاصطناعي', 'قريباً');
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

  getPriorityClass(priority: string): string {
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

  getActionPriorityClass(priority: string): string {
    return priority.toLowerCase();
  }
}
