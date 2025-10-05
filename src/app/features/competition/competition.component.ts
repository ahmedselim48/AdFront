import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { LucideAngularModule, BarChart3, TrendingUp, Target, Brain, Search, Eye, RefreshCw, Plus, ArrowRight } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { CompetitionService, CompetitionAnalysisDto } from '../../core/services/competition.service';

@Component({
  selector: 'app-competition',
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
    LucideAngularModule
  ],
  template: `
    <div class="competition-main">
      <!-- Header -->
      <div class="competition-header">
        <div class="header-info">
          <h1 class="competition-title">تحليل المنافسة</h1>
          <p class="competition-description">احصل على تحليل شامل لمنافسيك واقتراحات ذكية لتحسين أداء إعلاناتك</p>
        </div>
        <div class="header-actions">
          <button class="action-btn primary" (click)="startNewAnalysis()">
            <lucide-icon name="plus" size="16"></lucide-icon>
            <span>تحليل جديد</span>
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="quick-stats">
        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="bar-chart-3" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalAnalyses }}</div>
            <div class="stat-label">تحليل مكتمل</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="trending-up" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ averagePosition }}%</div>
            <div class="stat-label">متوسط الموقع</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <lucide-icon name="target" size="24"></lucide-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ activeAnalyses }}</div>
            <div class="stat-label">تحليل نشط</div>
          </div>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="navigation-tabs">
        <div class="tab-nav">
          <button class="tab-btn" 
                  [class.active]="activeTab === 0" 
                  (click)="setActiveTab(0)">
            <lucide-icon name="bar-chart-3" size="18"></lucide-icon>
            <span>لوحة التحكم</span>
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab === 1" 
                  (click)="setActiveTab(1)">
            <lucide-icon name="search" size="18"></lucide-icon>
            <span>التحليلات</span>
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab === 2" 
                  (click)="setActiveTab(2)">
            <lucide-icon name="trending-up" size="18"></lucide-icon>
            <span>رؤى السوق</span>
          </button>
          <button class="tab-btn" 
                  [class.active]="activeTab === 3" 
                  (click)="setActiveTab(3)">
            <lucide-icon name="brain" size="18"></lucide-icon>
            <span>الاقتراحات الذكية</span>
          </button>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./competition.component.scss']
})
export class CompetitionComponent implements OnInit, OnDestroy {
  activeTab = 0;
  isLoading = false;
  totalAnalyses = 0;
  averagePosition = 0;
  activeAnalyses = 0;
  recentAnalyses: CompetitionAnalysisDto[] = [];
  allAnalyses: CompetitionAnalysisDto[] = [];

  private destroy$ = new Subject<void>();
  private competitionService = inject(CompetitionService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadAnalyses();
    this.setActiveTabFromRoute();
  }

  setActiveTabFromRoute() {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(url => {
      const path = url[0]?.path;
      switch (path) {
        case 'dashboard':
          this.activeTab = 0;
          break;
        case 'analyses':
          this.activeTab = 1;
          break;
        case 'insights':
          this.activeTab = 2;
          break;
        case 'ai-suggestions':
          this.activeTab = 3;
          break;
        default:
          this.activeTab = 0;
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnalyses() {
    this.isLoading = true;
    this.competitionService.getUserAnalyses(1, 10)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.allAnalyses = response.data;
            this.recentAnalyses = response.data.slice(0, 3);
            this.totalAnalyses = response.data.length;
            this.calculateStats();
          } else {
            this.toastr.error(response.message || 'فشل في تحميل التحليلات', 'خطأ');
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading analyses:', error);
          this.toastr.error('فشل في تحميل التحليلات', 'خطأ');
          this.isLoading = false;
        }
      });
  }

  calculateStats() {
    if (this.allAnalyses.length === 0) return;

    // Calculate average market position
    const totalPosition = this.allAnalyses.reduce((sum, analysis) => sum + analysis.marketPosition, 0);
    this.averagePosition = Math.round(totalPosition / this.allAnalyses.length);

    // Count active analyses (completed in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    this.activeAnalyses = this.allAnalyses.filter(analysis => 
      new Date(analysis.createdAt) > sevenDaysAgo
    ).length;
  }

  setActiveTab(tabIndex: number) {
    this.activeTab = tabIndex;
    // Navigate to the appropriate route based on tab
    const routes = ['dashboard', 'analyses', 'insights', 'ai-suggestions'];
    this.router.navigate([`/profile/competition/${routes[tabIndex]}`]);
    
    // إضافة معلومات للـ console لتتبع التنقل
    console.log('🔄 تم التنقل إلى:', routes[tabIndex]);
  }

  startNewAnalysis() {
    this.router.navigate(['/profile/competition/analysis/new']);
  }

  viewAnalysis(analysisId: string) {
    this.router.navigate(['/profile/competition/analysis', analysisId]);
  }

  viewMarketInsights() {
    this.router.navigate(['/profile/competition/insights']);
  }

  generateAISuggestions() {
    this.router.navigate(['/profile/competition/ai-suggestions']);
  }

  refreshData() {
    this.loadAnalyses();
    this.toastr.success('تم تحديث البيانات', 'تم');
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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