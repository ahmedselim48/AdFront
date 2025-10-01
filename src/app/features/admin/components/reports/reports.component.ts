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
import { Subject, takeUntil, firstValueFrom } from 'rxjs';
import { StatisticsService, AdminReportDto, GeneralResponse } from '../../../../core/services/statistics.service';
import { AdminService, AdminUserDto, AdminAdDto, PaginatedUsersResponse, PaginatedAdsResponse } from '../../../../core/services/admin.service';

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
    MatBadgeModule,
  ],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  loading = false;
  selectedPeriod = 'custom';
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
    { value: 'custom', label: 'مخصص' }
  ];

  constructor(
    private statisticsService: StatisticsService, 
    private adminService: AdminService
  ) {}

  ngOnInit(): void {
    this.loadReports();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadReports(): void {
    this.loading = true;
    const handler = (response: GeneralResponse<AdminReportDto>) => {
      if (response?.success && response.data) {
        this.processReportData(response.data);
      }
      this.loading = false;
    };

    // always call date-range report
    const fromUtc = new Date(this.selectedDateRange.start).toISOString();
    const toUtc = new Date(this.selectedDateRange.end).toISOString();
    this.statisticsService.getReportByRange(fromUtc, toUtc)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: handler,
        error: (e) => { console.error('Error loading range report:', e); this.loading = false; }
      });

    // اجلب أرباح المنصة الشهرية عبر إحصائيات الأدمن (time-series)
    this.statisticsService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: GeneralResponse<any>) => {
          const dict = res?.data?.monthlyEarnings || {};
          const entries = Object.entries(dict) as [string, number][];
          // ترتيب حسب السنة/الشهر من المفتاح بصيغة YYYY-MM
          entries.sort((a,b) => a[0].localeCompare(b[0]));
          const labels = entries.map(([k]) => k);
          const values = entries.map(([,v]) => Number(v));
          // اجمالي إيرادات المنصة خلال الفترة المتاحة
          const totalPlatformRevenue = values.reduce((s,n) => s + (Number(n) || 0), 0);
          // اجمالي إيرادات الاشتراكات (اعتماداً على عدد الاشتراكات × 200)
          const totalSubscriptions = Number(res?.data?.totalSubscriptions ?? 0);
          const subscriptionsRevenue = totalSubscriptions * 200;
          // حدّث كروت الإحصائيات في التقارير
          this.stats.totalRevenue = subscriptionsRevenue || totalPlatformRevenue || 0;
          // استخدم إجمالي المستخدمين والإعلانات من إحصائيات الأدمن لضمان عدم العودة بصفر
          this.stats.totalUsers = Number(res?.data?.totalUsers ?? this.stats.totalUsers ?? 0);
          this.stats.totalAds = Number(res?.data?.totalAds ?? this.stats.totalAds ?? 0);
          
          
          this.chartData = {
            labels,
            datasets: [
              {
                label: 'إيرادات المنصة الشهرية (SAR)',
                data: values,
                backgroundColor: ['rgba(67, 233, 123, 0.2)'],
                borderColor: ['rgba(67, 233, 123, 1)'],
                borderWidth: 2
              }
            ]
          };
        },
        error: (e) => console.error('Error loading platform monthly earnings:', e)
      });

    // اجلب إجمالي المشاهدات من تحليلات الفئات (يتضمن TotalViews)
    this.statisticsService.getCategoryAnalytics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: GeneralResponse<any>) => {
          console.log('Category Analytics Response:', res);
          const totalViews = Number(res?.data?.totalViews ?? res?.data?.TotalViews ?? 0);
          console.log('Total Views extracted:', totalViews);
          this.stats.totalViews = isFinite(totalViews) ? totalViews : 0;
          console.log('Stats totalViews updated to:', this.stats.totalViews);
        },
        error: (e) => console.error('Error loading category analytics (views):', e)
      });
  }

  private processReportData(data: AdminReportDto): void {
    // خريطة القيم من DTO الحقيقي
    const totalUsers = data.totalNewUsers ?? 0;
    const totalAds = data.totalNewAds ?? 0;
    const totalRevenue = (this.selectedPeriod === 'monthly' ? data.thisMonthEarnings : data.totalEarnings) ?? 0;

    // احتفظ بقيمة totalViews الحالية ولا تعيد تعيينها إلى 0
    this.stats = {
      totalUsers,
      totalAds,
      totalViews: this.stats.totalViews, // احتفظ بالقيمة الحالية
      totalRevenue,
      userGrowth: 0,
      adGrowth: 0,
      viewGrowth: 0,
      revenueGrowth: 0
    };

    // ابنِ بيانات الرسم من عناصر التقرير
    const usersItem = data.items?.find(i => i.category === 'Users');
    const adsItem = data.items?.find(i => i.category === 'Ads');
    const earningsItem = data.items?.find(i => i.category === 'Payments');
    
    this.chartData = {
      labels: ['المستخدمون', 'الإعلانات', 'الإيرادات'],
      datasets: [
        {
          label: 'قيم التقرير',
          data: [
            usersItem?.count ?? totalUsers,
            adsItem?.count ?? totalAds,
            (typeof earningsItem?.value === 'number' ? Number(earningsItem!.value) : Number(totalRevenue))
          ],
          backgroundColor: ['rgba(102,126,234,0.2)','rgba(240,147,251,0.2)','rgba(67,233,123,0.2)'],
          borderColor: ['rgba(102,126,234,1)','rgba(240,147,251,1)','rgba(67,233,123,1)'],
          borderWidth: 2
        }
      ]
    };
  }

  // لم نعد نستخدم بيانات ثابتة؛ الرسم يُبنى في processReportData من استجابة الباك

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;
    this.loadReports();
  }

  onDateRangeChange(): void {
    this.loadReports();
  }


  exportReport(format: 'pdf' | 'excel'): void {
    const isPdf = format === 'pdf';
    if (isPdf) {
      this.openPrintView();
      return;
    }
    const csv = this.buildCsvFromFrontendData();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `custom-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- New: Users monthly print ---
  async printUsersReport(): Promise<void> {
    const from = new Date(this.selectedDateRange.start);
    const to = this.endOfDay(new Date(this.selectedDateRange.end));
    const title = 'تقرير المستخدمين';
    const users = await this.fetchUsersInRange(from, to);
    const headers = ['الاسم', 'البريد', 'تاريخ الإنشاء'];
    const rows = users.map(u => [
      u.fullName || u.userName || '-',
      u.email || '-',
      new Date(u.createdAt).toLocaleDateString('ar-SA')
    ] as [string,string,string]);
    this.openSimplePdfView3(title, from, to, headers, rows);
  }

  // --- New: Ads monthly print ---
  async printAdsReport(): Promise<void> {
    const from = new Date(this.selectedDateRange.start);
    const to = this.endOfDay(new Date(this.selectedDateRange.end));
    const title = 'تقرير الإعلانات';
    const ads = await this.fetchAdsInRange(from, to);
    const headers = ['العنوان', 'الحالة', 'تاريخ الإنشاء'];
    const rows = ads.map(a => [
      a.title || '-',
      a.status || '-',
      new Date(a.createdAt).toLocaleDateString('ar-SA')
    ] as [string,string,string]);
    this.openSimplePdfView3(title, from, to, headers, rows);
  }

  // حذف ملخص النظام بناءً على الطلب

  private buildMonthlyList(kind: 'users' | 'ads'): Array<[string, string]> {
    // نحضّر الآن لقوائم تفصيلية بدل المجاميع. هذه الدالة ستُستخدم كـ fallback إذا تعذّر جلب القوائم.
    const labels = this.chartData.labels || [];
    const values = this.chartData.datasets?.[0]?.data || [];
    return labels.map((m, i) => [String(m), this.formatNumber(Number(values[i] ?? 0))]);
  }

  private async fetchUsersInRange(from: Date, to: Date): Promise<AdminUserDto[]> {
    const results: AdminUserDto[] = [];
    let page = 1;
    const pageSize = 100;
    const maxItems = 1000; // سقف أمان
    while (results.length < maxItems) {
      const resp = await firstValueFrom(this.adminService.getUsers(page, pageSize));
      const data = (resp?.data as PaginatedUsersResponse | undefined);
      const batch = data?.users || [];
      if (!batch.length) break;
      for (const u of batch) {
        const created = this.parseDate(u.createdAt);
        if (created && created >= from && created <= to) results.push(u);
        if (results.length >= maxItems) break;
      }
      const totalPages = (data?.totalPages && data.totalPages > 0)
        ? data.totalPages
        : Math.ceil((data?.totalCount || batch.length) / pageSize) || page;
      if (page >= totalPages) break;
      page += 1;
    }
    return results;
  }

  private async fetchAdsInRange(from: Date, to: Date): Promise<AdminAdDto[]> {
    const results: AdminAdDto[] = [];
    let page = 1;
    const pageSize = 100;
    const maxItems = 1000;
    while (results.length < maxItems) {
      const resp = await firstValueFrom(this.adminService.getAds(page, pageSize));
      const data = (resp?.data as PaginatedAdsResponse | undefined);
      const batch = data?.ads || [];
      if (!batch.length) break;
      for (const a of batch) {
        const created = this.parseDate(a.createdAt);
        if (created && created >= from && created <= to) results.push(a);
        if (results.length >= maxItems) break;
      }
      const totalPages = (data?.totalPages && data.totalPages > 0)
        ? data.totalPages
        : Math.ceil((data?.totalCount || batch.length) / pageSize) || page;
      if (page >= totalPages) break;
      page += 1;
    }
    return results;
  }

  private openSimplePdfView(title: string, from: Date, to: Date, headers: string[], rows: Array<[string, string]>): void {
    const fromStr = from.toLocaleDateString('ar-SA');
    const toStr = to.toLocaleDateString('ar-SA');
    const tableRows = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td></tr>`).join('');
    const html = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Tajawal, 'Noto Sans Arabic', sans-serif; padding: 24px; color: #1f2937; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    .muted { color: #6b7280; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: center; }
    th { background: #f3f4f6; }
    .footer { margin-top: 16px; color: #6b7280; font-size: 12px; }
    @media print { .no-print { display: none; } }
  </style>
  </head>
  <body>
    <div class="no-print" style="text-align:left; margin-bottom:8px;">
      <button onclick="window.print()">طباعة</button>
    </div>
    <h1>${title}</h1>
    <div class="muted">من ${fromStr} إلى ${toStr}</div>
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">تم إنشاء التقرير من واجهة المستخدم.</div>
  </body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) { return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  private openSimplePdfView3(title: string, from: Date, to: Date, headers: string[], rows: Array<[string, string, string]>): void {
    const fromStr = from.toLocaleDateString('ar-SA');
    const toStr = to.toLocaleDateString('ar-SA');
    const tableRows = rows.map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('');
    const html = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    body { font-family: Tajawal, 'Noto Sans Arabic', sans-serif; padding: 24px; color: #1f2937; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    .muted { color: #6b7280; margin-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: center; }
    th { background: #f3f4f6; }
    .footer { margin-top: 16px; color: #6b7280; font-size: 12px; }
    @media print { .no-print { display: none; } }
  </style>
  </head>
  <body>
    <div class="no-print" style="text-align:left; margin-bottom:8px;">
      <button onclick="window.print()">طباعة</button>
    </div>
    <h1>${title}</h1>
    <div class="muted">من ${fromStr} إلى ${toStr}</div>
    <table>
      <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
    <div class="footer">تم إنشاء التقرير من واجهة المستخدم.</div>
  </body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) { return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  private buildCsvFromFrontendData(): string {
    const lines: string[] = [];
    const from = this.selectedDateRange.start.toISOString();
    const to = this.selectedDateRange.end.toISOString();
    lines.push('Section,Key,Value');
    lines.push(`Meta,From,${from}`);
    lines.push(`Meta,To,${to}`);
    lines.push(`Summary,TotalUsers,${this.stats.totalUsers}`);
    lines.push(`Summary,TotalAds,${this.stats.totalAds}`);
    lines.push(`Summary,TotalRevenue,${this.stats.totalRevenue}`);
    lines.push('');
    lines.push('TimeSeries,Month,Value');
    const labels = this.chartData.labels || [];
    const dataset0 = this.chartData.datasets?.[0]?.data || [];
    for (let i = 0; i < labels.length; i++) {
      const label = String(labels[i] ?? '');
      const value = Number(dataset0[i] ?? 0);
      lines.push(`Row,${label},${value}`);
    }
    return lines.join('\n');
  }

  private openPrintView(): void {
    const from = this.selectedDateRange.start.toLocaleDateString('ar-SA');
    const to = this.endOfDay(new Date(this.selectedDateRange.end)).toLocaleDateString('ar-SA');
    const html = `
<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <title>تقرير مخصص</title>
  <style>
    body { font-family: Tajawal, 'Noto Sans Arabic', sans-serif; padding: 24px; color: #1f2937; }
    h1 { margin: 0 0 8px; font-size: 20px; }
    .muted { color: #6b7280; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 16px 0 24px; }
    .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; }
    .card h3 { margin: 0 0 4px; font-size: 14px; color: #6b7280; }
    .card .value { font-size: 18px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; margin-top: 12px; }
    th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: center; }
    th { background: #f3f4f6; }
    .footer { margin-top: 16px; color: #6b7280; font-size: 12px; }
    @media print { .no-print { display: none; } }
  </style>
  </head>
  <body>
    <div class="no-print" style="text-align:left; margin-bottom:8px;">
      <button onclick="window.print()">طباعة</button>
    </div>
    <h1>تقرير مخصص</h1>
    <div class="muted">من ${from} إلى ${to}</div>
    <div class="grid">
      <div class="card"><h3>إجمالي المستخدمين</h3><div class="value">${this.formatNumber(this.stats.totalUsers)}</div></div>
      <div class="card"><h3>إجمالي الإعلانات</h3><div class="value">${this.formatNumber(this.stats.totalAds)}</div></div>
      <div class="card"><h3>إجمالي الإيرادات</h3><div class="value">${this.formatCurrency(this.stats.totalRevenue)}</div></div>
    </div>
    <table>
      <thead><tr><th>الشهر</th><th>القيمة</th></tr></thead>
      <tbody>
        ${(this.chartData.labels || []).map((label, i) => {
          const v = Number(this.chartData.datasets?.[0]?.data?.[i] ?? 0);
          return `<tr><td>${label ?? ''}</td><td>${v}</td></tr>`;
        }).join('')}
      </tbody>
    </table>
    <div class="footer">تم إنشاء التقرير من واجهة المستخدم.</div>
  </body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) { return; }
    w.document.open();
    w.document.write(html);
    w.document.close();
  }

  // Helpers for template computations
  getBarHeight(value: unknown, max: number = 300): number {
    const num = Number(value ?? 0);
    if (!isFinite(num) || num < 0) return 0;
    return (num / max) * 100;
  }

  getNumeric(value: unknown): number {
    const num = Number(value ?? 0);
    return isFinite(num) ? num : 0;
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

  private endOfDay(d: Date): Date {
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private parseDate(value?: string): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

}
