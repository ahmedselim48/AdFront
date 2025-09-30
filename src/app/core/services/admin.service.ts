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
  period: string; // Weekly | Monthly
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
    return this.http.put<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}/reject`, reason);
  }

  deleteAd(adId: string): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.baseUrl}/ads/${adId}`);
  }

  // Statistics
  getStatistics(): Observable<GeneralResponse<AdminStatisticsDto>> {
    return this.http.get<GeneralResponse<AdminStatisticsDto>>(`${this.baseUrl}/statistics`);
  }

  // User Subscription
  getUserSubscription(userId: string): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(`${this.baseUrl}/users/${userId}/subscription`);
  }

  // Reports
  getWeeklyReport(): Observable<GeneralResponse<AdminReportDto>> {
    return this.http.get<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/reports/weekly`);
  }

  getMonthlyReport(): Observable<GeneralResponse<AdminReportDto>> {
    return this.http.get<GeneralResponse<AdminReportDto>>(`${this.baseUrl}/reports/monthly`);
  }

  exportWeeklyReport(format: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/weekly/export?format=${format}`, { 
      responseType: 'blob' 
    });
  }

  exportMonthlyReport(format: string = 'pdf'): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/reports/monthly/export?format=${format}`, { 
      responseType: 'blob' 
    });
  }

  // Categories
  getAllCategories(): Observable<GeneralResponse<CategoryDto[]>> {
    return this.http.get<GeneralResponse<CategoryDto[]>>(`${this.baseUrl}/categories`);
  }
}