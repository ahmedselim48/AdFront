import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AdminStatisticsDto {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyEarnings: { [key: string]: number };
  totalEarnings: number;
  totalAds: number;
  totalRejectedAds: number;
  totalAcceptedAds: number;
}

export interface AdminReportItemDto {
  title: string;
  category: string;
  value: number;
  count: number;
}

export interface AdminReportDto {
  period: string; // Custom
  from: string;
  to: string;
  items: AdminReportItemDto[];
  totalEarnings: number;
  thisMonthEarnings: number;
  totalNewUsers: number;
  totalNewAds: number;
}

export interface DashboardStatsDto {
  totalCategories: number;
  categories: Array<{
    id: number;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt?: string;
  }>;
  lastUpdated: string;
}

export interface GeneralResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Get admin statistics
  getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>> {
    return this.http.get<GeneralResponse<AdminStatisticsDto>>(`${this.baseUrl}/statistics`);
  }

  // Get dashboard statistics
  getDashboardStats(): Observable<GeneralResponse<DashboardStatsDto>> {
    return this.http.get<GeneralResponse<DashboardStatsDto>>(`${this.baseUrl}/dashboard/stats`);
  }

  // Get report by date range
  getReportByRange(fromUtc: string, toUtc: string): Observable<GeneralResponse<AdminReportDto>> {
    return this.http.get<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/reports/range`, { params: { fromUtc, toUtc } });
  }

  // Export report by date range
  exportReportByRange(fromUtc: string, toUtc: string, format: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/range/export?fromUtc=${encodeURIComponent(fromUtc)}&toUtc=${encodeURIComponent(toUtc)}&format=${format}`, { responseType: 'blob' });
  }

  // Get category analytics
  getCategoryAnalytics(): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${this.baseUrl}/dashboard/categories/analytics`);
  }
}
