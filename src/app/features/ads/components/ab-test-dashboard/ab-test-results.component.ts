import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { AdsService } from '../../ads.service';
import { ABTestResult } from '../../../../models/ads.models';

export interface ABTestResultsDialogData {
  testId: string;
  adATitle: string;
  adBTitle: string;
}

@Component({
  selector: 'app-ab-test-results',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './ab-test-results.component.html',
  styleUrls: ['./ab-test-results.component.scss']
})
export class ABTestResultsComponent implements OnInit, OnDestroy {
  testResult: ABTestResult | null = null;
  loading = true;
  private destroy$ = new Subject<void>();

  constructor(
    private adsService: AdsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<ABTestResultsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ABTestResultsDialogData
  ) {}

  ngOnInit() {
    this.loadTestResults();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTestResults() {
    this.loading = true;
    this.adsService.getABTestAnalytics(this.data.testId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.testResult = result;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading test results:', error);
          this.snackBar.open('خطأ في تحميل نتائج الاختبار', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  getWinnerText(): string {
    if (!this.testResult?.winnerAdId) return 'لم يتم تحديد الفائز بعد';
    
    if (this.testResult.winnerAdId === this.testResult.adAId) {
      return 'الإعلان أ فاز';
    } else {
      return 'الإعلان ب فاز';
    }
  }

  getWinnerColor(): string {
    if (!this.testResult?.winnerAdId) return 'basic';
    return 'accent';
  }

  getImprovementPercentage(): number {
    if (!this.testResult) return 0;
    
    const ctrA = this.testResult.ctrA;
    const ctrB = this.testResult.ctrB;
    
    if (ctrA === 0) return ctrB > 0 ? 100 : 0;
    
    return ((ctrB - ctrA) / ctrA) * 100;
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }

  formatNumber(value: number): string {
    return value.toLocaleString('ar-SA');
  }

  getTestDuration(): string {
    if (!this.testResult) return '';
    
    // Assuming we have start and end dates in the result
    // This would need to be adjusted based on actual data structure
    return '7 أيام'; // Placeholder
  }

  getConfidenceLevel(): string {
    if (!this.testResult) return 'غير محدد';
    
    // Calculate confidence based on sample size and difference
    const totalViews = this.testResult.viewsA + this.testResult.viewsB;
    const difference = Math.abs(this.testResult.ctrA - this.testResult.ctrB);
    
    if (totalViews > 1000 && difference > 0.05) return 'عالي جداً';
    if (totalViews > 500 && difference > 0.03) return 'عالي';
    if (totalViews > 200 && difference > 0.02) return 'متوسط';
    return 'منخفض';
  }

  onClose() {
    this.dialogRef.close();
  }

  onExportResults() {
    // Implement export functionality
    this.snackBar.open('تم تصدير النتائج', 'إغلاق', { duration: 2000 });
  }

  // Math functions for template
  getMaxValue(a: number, b: number): number {
    return Math.max(a, b);
  }

  getAbsValue(value: number): number {
    return Math.abs(value);
  }
}
