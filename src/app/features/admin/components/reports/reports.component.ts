import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { Subject, takeUntil } from 'rxjs';
import { StatisticsService, AdminReportDto, GeneralResponse } from '../../../../core/services/statistics.service';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
    borderColor: string[];
    borderWidth: number;
  }[];
}

interface ReportData {
  period: string;
  totalUsers: number;
  totalAds: number;
  totalViews: number;
  totalRevenue: number;
  growthRate: number;
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatBadgeModule
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = false;
  selectedPeriod = 'monthly';
  selectedDateRange = {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  };

  // Report Data
  reportData: ReportData[] = [];
  chartData: ChartData = {
    labels: [],
    datasets: []
  };

  // Statistics
  stats = {
    totalUsers: 0,
    totalAds: 0,
    totalViews: 0,
    totalRevenue: 0,
    userGrowth: 0,
    adGrowth: 0,
    viewGrowth: 0,
    revenueGrowth: 0
  };

  // Chart Options
  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            family: 'Tajawal, Noto Sans Arabic, sans-serif',
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white',
        borderColor: '#667eea',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: 'Tajawal, Noto Sans Arabic, sans-serif'
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          font: {
            family: 'Tajawal, Noto Sans Arabic, sans-serif'
          }
        }
      }
    }
  };

  periodOptions = [
    { value: 'daily', label: 'يومي' },
    { value: 'weekly', label: 'أسبوعي' },
    { value: 'monthly', label: 'شهري' },
    { value: 'yearly', label: 'سنوي' }
  ];

  constructor(private statisticsService: StatisticsService) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReports(): void {
    this.loading = true;
    
    // Load weekly and monthly reports
    this.statisticsService.getWeeklyReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<any>) => {
          if (response.success && response.data) {
            this.processReportData(response.data);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading weekly report:', error);
          this.loading = false;
        }
      });

    this.statisticsService.getMonthlyReport()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<any>) => {
          if (response.success && response.data) {
            this.processReportData(response.data);
          }
        },
        error: (error) => {
          console.error('Error loading monthly report:', error);
        }
      });
  }

  private processReportData(data: any): void {
    // Process the report data and update statistics
    this.stats = {
      totalUsers: data.totalUsers || 0,
      totalAds: data.totalAds || 0,
      totalViews: data.totalViews || 0,
      totalRevenue: data.totalRevenue || 0,
      userGrowth: data.userGrowth || 0,
      adGrowth: data.adGrowth || 0,
      viewGrowth: data.viewGrowth || 0,
      revenueGrowth: data.revenueGrowth || 0
    };

    // Generate chart data
    this.generateChartData();
  }

  private generateChartData(): void {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    this.chartData = {
      labels: months.slice(0, 6), // Last 6 months
      datasets: [
        {
          label: 'المستخدمين',
          data: [120, 150, 180, 200, 250, 300],
          backgroundColor: ['rgba(102, 126, 234, 0.2)'],
          borderColor: ['rgba(102, 126, 234, 1)'],
          borderWidth: 2
        },
        {
          label: 'الإعلانات',
          data: [80, 120, 150, 180, 220, 280],
          backgroundColor: ['rgba(240, 147, 251, 0.2)'],
          borderColor: ['rgba(240, 147, 251, 1)'],
          borderWidth: 2
        },
        {
          label: 'المشاهدات',
          data: [500, 800, 1200, 1500, 2000, 2500],
          backgroundColor: ['rgba(67, 233, 123, 0.2)'],
          borderColor: ['rgba(67, 233, 123, 1)'],
          borderWidth: 2
        }
      ]
    };
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadReports();
  }

  onDateRangeChange(): void {
    this.loadReports();
  }

  exportReport(format: 'pdf' | 'excel'): void {
    if (format === 'pdf') {
      this.statisticsService.exportWeeklyReport('pdf')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.pdf`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Error exporting PDF:', error);
          }
        });
    } else {
      this.statisticsService.exportMonthlyReport('excel')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (blob) => {
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `report-${new Date().toISOString().split('T')[0]}.xlsx`;
            link.click();
            window.URL.revokeObjectURL(url);
          },
          error: (error) => {
            console.error('Error exporting Excel:', error);
          }
        });
    }
  }

  refreshReports(): void {
    this.loadReports();
  }

  getGrowthColor(growth: number): string {
    return growth >= 0 ? 'primary' : 'warn';
  }

  getGrowthIcon(growth: number): string {
    return growth >= 0 ? 'trending_up' : 'trending_down';
  }

  formatNumber(num: number): string {
    return new Intl.NumberFormat('ar-SA').format(num);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(amount);
  }
}
