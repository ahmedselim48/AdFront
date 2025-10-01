import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Models based on backend DTOs
export interface AdminUserDto {
  id: string;
  userName: string;
  email: string;
  fullName: string;
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  status: string; // "Active" or "Blocked"
  blockExpiryDate?: string;
  blockReason?: string;
  // Additional fields from ApplicationUser
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  profileImageUrl?: string;
  refreshToken?: string;
  refreshTokenExpiryTime?: string;
  passwordResetToken?: string;
  passwordResetTokenExpiry?: string;
  emailConfirmationToken?: string;
  emailConfirmationTokenExpiry?: string;
  googleId?: string;
  // Subscription info
  subscription?: SubscriptionDto;
}

export interface SubscriptionDto {
  userId: string;
  isActive: boolean;
  endDate: string;
  provider: string;
  amount: number;
  daysLeft: number;
  message?: string;
}

export interface PaginatedUsersResponse {
  users: AdminUserDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AdminAdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: string; // "Pending", "Approved", "Rejected"
  userId: string;
  ownerUserName: string;
  ownerEmail: string;
  createdAt: string;
  rejectionReason?: string;
}

export interface PaginatedAdsResponse {
  ads: AdminAdDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminStatisticsDto {
  totalUsers: number;
  totalSubscriptions: number;
  monthlyEarnings: { [key: string]: number };
  totalEarnings: number;
  totalAds: number;
  totalRejectedAds: number;
  totalAcceptedAds: number;
  totalCategories: number;
  activeUsers: number;
  blockedUsers: number;
  publishedAds: number;
  pendingAds: number;
  topCategories: Array<{
    name: string;
    viewCount: number;
  }>;
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

export interface GeneralResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface BlockUserRequestDto {
  userId: string;
  durationDays: number;
  reason?: string;
}

export interface ReviewAdRequestDto {
  adId: string;
  accept: boolean;
  rejectionReason?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;
  private readonly dashboardUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(private http: HttpClient) {}

  // User Management
  getUsers(page: number = 1, pageSize: number = 20, searchTerm?: string): Observable<GeneralResponse<PaginatedUsersResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }

    return this.http.get<GeneralResponse<PaginatedUsersResponse>>(`${this.baseUrl}/users`, { params });
  }

  deleteUser(userId: string): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.baseUrl}/users/${userId}`);
  }

  banUser7Days(userId: string, reason?: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/users/${userId}/ban/7days`, reason);
  }

  banUserPermanent(userId: string, reason?: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/users/${userId}/ban/permanent`, reason);
  }

  unbanUser(userId: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/users/${userId}/unban`, {});
  }

  // Ads Management
  getAds(page: number = 1, pageSize: number = 20, searchTerm?: string, status?: string): Observable<GeneralResponse<PaginatedAdsResponse>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (searchTerm) {
      params = params.set('searchTerm', searchTerm);
    }
    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<GeneralResponse<PaginatedAdsResponse>>(`${this.baseUrl}/ads`, { params });
  }

  getAdById(adId: string): Observable<GeneralResponse<AdminAdDto>> {
    return this.http.get<GeneralResponse<AdminAdDto>>(`${this.baseUrl}/ads/${adId}`);
  }

  acceptAd(adId: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}/accept`, {});
  }

  rejectAd(adId: string, reason?: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}/reject`, { reason });
  }

  setPendingAd(adId: string): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}/pending`, {});
  }

  deleteAd(adId: string): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}`);
  }

  // Statistics
  getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>> {
    return this.http.get<GeneralResponse<AdminStatisticsDto>>(`${this.baseUrl}/statistics`);
  }

  // Admin Dashboard
  getDashboardStats(): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${this.dashboardUrl}/stats`);
  }

  getDashboardCategories(): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${this.dashboardUrl}/categories`);
  }

  getDashboardCategoryAnalytics(categoryId?: number): Observable<GeneralResponse<any>> {
    const url = categoryId != null
      ? `${this.dashboardUrl}/categories/analytics?categoryId=${categoryId}`
      : `${this.dashboardUrl}/categories/analytics`;
    return this.http.get<GeneralResponse<any>>(url);
  }

  // User Subscription
  getUserSubscription(userId: string): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(`${this.baseUrl}/users/${userId}/subscription`);
  }

  // Reports by date range only
  getReportByRange(fromUtc: string, toUtc: string): Observable<GeneralResponse<AdminReportDto>> {
    return this.http.get<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/reports/range`, { params: { fromUtc, toUtc } });
  }

  exportReportByRange(format: string, fromUtc: string, toUtc: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/range/export?fromUtc=${encodeURIComponent(fromUtc)}&toUtc=${encodeURIComponent(toUtc)}&format=${format}`, { responseType: 'blob' });
  }

  // Categories
  getAllCategories(): Observable<GeneralResponse<CategoryDto[]>> {
    return this.http.get<GeneralResponse<CategoryDto[]>>(`${this.baseUrl}/categories`);
  }

  getCategoryById(id: number): Observable<GeneralResponse<CategoryDto>> {
    return this.http.get<GeneralResponse<CategoryDto>>(`${this.baseUrl}/categories/${id}`);
  }

  createCategory(payload: { name: string; description?: string }): Observable<GeneralResponse<CategoryDto>> {
    return this.http.post<GeneralResponse<CategoryDto>>(`${this.baseUrl}/categories`, payload);
  }

  updateCategory(id: number, payload: { name: string; description?: string }): Observable<GeneralResponse<CategoryDto>> {
    return this.http.put<GeneralResponse<CategoryDto>>(`${this.baseUrl}/categories/${id}`, payload);
  }

  deleteCategory(id: number): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.baseUrl}/categories/${id}`);
  }

  // Category price ranges (from API CategoriesController)
  getCategoriesWithPriceRanges(): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${environment.apiUrl}/api/Categories/with-price-ranges`);
  }

  updateCategoryPriceRanges(id: number, payload: { minPrice?: number; maxPrice?: number }): Observable<GeneralResponse<any>> {
    return this.http.put<GeneralResponse<any>>(`${environment.apiUrl}/api/Categories/${id}/price-ranges`, payload);
  }

  getCategoryWithAds(id: number): Observable<GeneralResponse<any>> {
    return this.http.get<GeneralResponse<any>>(`${environment.apiUrl}/api/Categories/${id}/with-ads`);
  }
}