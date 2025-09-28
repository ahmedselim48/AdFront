import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { MockApiService } from './mock-api.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  PaginatedUsersResponse,
  UserDto,
  BlockUserRequestDto,
  AdminStatisticsDto,
  AdminReportDto
} from '../../models/admin.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private api = inject(ApiClientService);
  private mockApi = inject(MockApiService);
  private baseUrl = environment.apiBaseUrl;

  // User Management
  getUsers(page = 1, pageSize = 20, searchTerm?: string): Observable<GeneralResponse<PaginatedUsersResponse>> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (searchTerm) params.set('searchTerm', searchTerm);

    return this.api.get$<GeneralResponse<PaginatedUsersResponse>>(`${this.baseUrl}/admin/users?${params.toString()}`);
  }

  deleteUser(userId: string): Observable<GeneralResponse<boolean>> {
    return this.api.delete$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}`);
  }

  banUser7Days(userId: string, reason?: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}/ban/7days`, reason || '');
  }

  banUserPermanent(userId: string, reason?: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}/ban/permanent`, reason || '');
  }

  unbanUser(userId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/users/${userId}/unban`, {});
  }

  // Ads Management
  getAds(page = 1, pageSize = 20, searchTerm?: string, status?: string): Observable<GeneralResponse<any>> {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    if (searchTerm) params.set('searchTerm', searchTerm);
    if (status) params.set('status', status);

    return this.api.get$<GeneralResponse<any>>(`${this.baseUrl}/admin/ads?${params.toString()}`);
  }

  getAdById(adId: string): Observable<GeneralResponse<any>> {
    return this.api.get$<GeneralResponse<any>>(`${this.baseUrl}/admin/ads/${adId}`);
  }

  acceptAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/ads/${adId}/accept`, {});
  }

  rejectAd(adId: string, reason?: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/ads/${adId}/reject`, reason || '');
  }

  deleteAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.api.delete$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/ads/${adId}`);
  }

  // Statistics
  getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>> {
    if (environment.production) {
      return this.api.get$<GeneralResponse<AdminStatisticsDto>>(`${this.baseUrl}/admin/statistics`);
    } else {
      // Mock data for development
      return this.mockApi.getAdminStatistics() as Observable<GeneralResponse<AdminStatisticsDto>>;
    }
  }

  // Reports
  getWeeklyReport(): Observable<GeneralResponse<AdminReportDto>> {
    return this.api.get$<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/admin/reports/weekly`);
  }

  getMonthlyReport(): Observable<GeneralResponse<AdminReportDto>> {
    return this.api.get$<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/admin/reports/monthly`);
  }

  exportWeeklyReport(format = 'pdf'): Observable<Blob> {
    return this.api.getBlob$(`${this.baseUrl}/admin/reports/weekly/export?format=${format}`);
  }

  exportMonthlyReport(format = 'pdf'): Observable<Blob> {
    return this.api.getBlob$(`${this.baseUrl}/admin/reports/monthly/export?format=${format}`);
  }

  // Dashboard
  getDashboardStats(): Observable<GeneralResponse<any>> {
    if (environment.production) {
      return this.api.get$<GeneralResponse<any>>(`${this.baseUrl}/admin/dashboard/stats`);
    } else {
      // Mock data for development
      return this.mockApi.getAdminDashboardStats();
    }
  }

  getCategoryManagementData(): Observable<GeneralResponse<any>> {
    return this.api.get$<GeneralResponse<any>>(`${this.baseUrl}/admin/dashboard/categories`);
  }

  getCategoryAnalytics(categoryId?: number): Observable<GeneralResponse<any>> {
    const params = categoryId ? `?categoryId=${categoryId}` : '';
    return this.api.get$<GeneralResponse<any>>(`${this.baseUrl}/admin/dashboard/categories/analytics${params}`);
  }
}
