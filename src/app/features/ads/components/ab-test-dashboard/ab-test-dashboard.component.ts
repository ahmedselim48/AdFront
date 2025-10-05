import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, takeUntil } from 'rxjs';
import { AdsService } from '../../ads.service';
import { ABTestDto, ABTestResult } from '../../../../models/ads.models';
import { StartABTestDialogComponent } from './start-ab-test-dialog.component';
import { ABTestResultsComponent } from './ab-test-results.component';

@Component({
  selector: 'app-ab-test-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTableModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './ab-test-dashboard.component.html',
  styleUrls: ['./ab-test-dashboard.component.scss']
})
export class ABTestDashboardComponent implements OnInit, OnDestroy {
  abTests: ABTestDto[] = [];
  loading = false;
  displayedColumns: string[] = ['testName', 'ads', 'status', 'metrics', 'actions'];
  private destroy$ = new Subject<void>();

  constructor(
    private adsService: AdsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.loadABTests();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadABTests() {
    this.loading = true;
    this.adsService.getMyABTests()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (tests) => {
          this.abTests = tests;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading A/B tests:', error);
          this.snackBar.open('خطأ في تحميل اختبارات A/B', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  openStartTestDialog() {
    const dialogRef = this.dialog.open(StartABTestDialogComponent, {
      width: '600px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadABTests();
      }
    });
  }

  endTest(testId: string) {
    this.loading = true;
    this.adsService.endABTest(testId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          this.snackBar.open('تم إنهاء الاختبار بنجاح', 'إغلاق', { duration: 3000 });
          this.loadABTests();
        },
        error: (error) => {
          console.error('Error ending A/B test:', error);
          this.snackBar.open('خطأ في إنهاء الاختبار', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      });
  }


  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'running':
        return 'primary';
      case 'completed':
        return 'accent';
      case 'cancelled':
        return 'warn';
      default:
        return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'running':
        return 'جاري';
      case 'completed':
        return 'مكتمل';
      case 'cancelled':
        return 'ملغي';
      default:
        return status;
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'running':
        return 'play_circle';
      case 'completed':
        return 'check_circle';
      case 'cancelled':
        return 'cancel';
      default:
        return 'help';
    }
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'running':
        return 'status-running';
      case 'completed':
        return 'status-completed';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return 'status-default';
    }
  }

  getActiveTestsCount(): number {
    return this.abTests.filter(test => test.isActive).length;
  }

  getCompletedTestsCount(): number {
    return this.abTests.filter(test => !test.isActive).length;
  }

  getAverageImprovement(): number {
    if (this.abTests.length === 0) return 0;
    
    const improvements = this.abTests
      .filter(test => !test.isActive && test.winnerAdId)
      .map(test => {
        const winnerRate = test.winnerAdId === test.adAId ? test.adAClickRate : test.adBClickRate;
        const loserRate = test.winnerAdId === test.adAId ? test.adBClickRate : test.adAClickRate;
        return loserRate > 0 ? ((winnerRate - loserRate) / loserRate) * 100 : 0;
      });

    return improvements.length > 0 
      ? Math.round(improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length)
      : 0;
  }

  viewAd(adId: string): void {
    // Navigate to ad details page
    window.open(`/ads/${adId}`, '_blank');
  }

  viewResults(testId: string) {
    const test = this.abTests.find(t => t.testId === testId);
    if (test) {
      this.dialog.open(ABTestResultsComponent, {
        width: '1000px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        data: {
          testId: testId,
          adATitle: test.adATitle,
          adBTitle: test.adBTitle
        }
      });
    }
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(2)}%`;
  }
}
