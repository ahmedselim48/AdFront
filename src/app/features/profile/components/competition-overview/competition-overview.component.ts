import { Component, OnInit, OnDestroy, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { LucideAngularModule, BarChart3, TrendingUp, Target, Eye, ArrowRight, Plus } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CompetitionService, CompetitionAnalysisDto } from '../../../../core/services/competition.service';

@Component({
  selector: 'app-competition-overview',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    LucideAngularModule
  ],
  template: `
    <div class="competition-overview">
      <!-- Header -->
      <div class="overview-header" *ngIf="!embedded">
        <div class="header-info">
          <h2 class="overview-title">
            <lucide-icon name="bar-chart-3" size="20"></lucide-icon>
            تحليل المنافسة
          </h2>
          <p class="overview-description">تتبع أداء إعلاناتك مقارنة بالمنافسين</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" routerLink="/profile/competition">
            <lucide-icon name="eye" size="16"></lucide-icon>
            <span>عرض الكل</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats" *ngIf="!isLoading">
        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="bar-chart-3" size="20"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalAnalyses }}</div>
            <div class="stat-label">تحليل مكتمل</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="trending-up" size="20"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ averagePosition }}%</div>
            <div class="stat-label">متوسط الموقع</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="target" size="20"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeAnalyses }}</div>
            <div class="stat-label">تحليل نشط</div>
          </div>
        </div>
      </div>

      <!-- Recent Analyses -->
      <div class="recent-analyses" *ngIf="!isLoading && recentAnalyses.length > 0">
        <h3 class="section-title">التحليلات الأخيرة</h3>
        <div class="analyses-list">
          <div *ngFor="let analysis of recentAnalyses" 
               class="analysis-item" 
               routerLink="/profile/competition/analysis/{{ analysis.id }}">
            <div class="analysis-info">
              <div class="analysis-title">{{ analysis.category || 'تحليل عام' }}</div>
              <div class="analysis-details">
                <span class="detail">{{ analysis.competitorCount }} منافس</span>
                <span class="detail">{{ formatPrice(analysis.averageCompetitorPrice) }}</span>
              </div>
            </div>
            <div class="analysis-actions">
              <div class="analysis-status" [class]="getStatusClass(analysis.status)">
                {{ getStatusText(analysis.status) }}
              </div>
              <lucide-icon name="arrow-right" size="16"></lucide-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions" *ngIf="!isLoading">
        <h3 class="section-title">إجراءات سريعة</h3>
        <div class="actions-grid">
          <button class="quick-action-btn" routerLink="/profile/competition/analysis/new">
            <lucide-icon name="plus" size="20"></lucide-icon>
            <span>تحليل جديد</span>
          </button>
          <button class="quick-action-btn" routerLink="/profile/competition/insights">
            <lucide-icon name="trending-up" size="20"></lucide-icon>
            <span>رؤى السوق</span>
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
        <p>جاري تحميل بيانات المنافسة...</p>
      </div>

      <!-- Empty State -->
      <div *ngIf="!isLoading && totalAnalyses === 0" class="empty-state">
        <lucide-icon name="bar-chart-3" size="48" class="empty-icon"></lucide-icon>
        <h3>ابدأ بتحليل المنافسة</h3>
        <p>احصل على رؤى قيمة حول منافسيك في السوق</p>
        <button class="action-btn primary" routerLink="/profile/competition/analysis/new">
          <lucide-icon name="plus" size="16"></lucide-icon>
          <span>تحليل جديد</span>
        </button>
      </div>
    </div>
  `,
  styleUrls: ['./competition-overview.component.scss']
})
export class CompetitionOverviewComponent implements OnInit, OnDestroy {
  @Input() embedded = false;
  totalAnalyses = 0;
  averagePosition = 0;
  activeAnalyses = 0;
  recentAnalyses: CompetitionAnalysisDto[] = [];
  isLoading = false;

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private toastr = inject(ToastrService);

  ngOnInit() {
    this.loadAnalyses();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalyses() {
    this.isLoading = true;
    this.competitionService.getUserAnalyses(1, 5)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response.success && response.data) {
            this.recentAnalyses = response.data.slice(0, 3);
            this.totalAnalyses = response.data.length;
            this.calculateStats();
          } else {
            console.warn('Failed to load competition analyses:', response.message);
          }
          this.isLoading = false;
        },
        error: (error: any) => {
          console.error('Error loading competition analyses:', error);
          this.isLoading = false;
        }
      });
  }

  calculateStats() {
    if (this.recentAnalyses.length === 0) return;

    // Calculate average market position
    const totalPosition = this.recentAnalyses.reduce((sum, analysis) => sum + analysis.marketPosition, 0);
    this.averagePosition = Math.round(totalPosition / this.recentAnalyses.length);

    // Count active analyses (completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.activeAnalyses = this.recentAnalyses.filter(analysis => 
      new Date(analysis.createdAt) > sevenDaysAgo
    ).length;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'completed';
      case 'inprogress':
        return 'in-progress';
      case 'pending':
        return 'pending';
      case 'failed':
        return 'failed';
      default:
        return 'unknown';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'مكتمل';
      case 'inprogress':
        return 'جاري';
      case 'pending':
        return 'في الانتظار';
      case 'failed':
        return 'فشل';
      default:
        return status;
    }
  }
}
