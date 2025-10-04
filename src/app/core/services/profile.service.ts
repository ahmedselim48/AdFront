import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';
import { ProfileDto, ProfileUpdateDto, SubscriptionStatusDto } from '../../models/profile.models';
import { UserDashboardDto } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private readonly apiUrl = `${environment.apiUrl}/api/account`;

  constructor(private http: HttpClient) {}

  // Get user profile
  getProfile(): Observable<GeneralResponse<ProfileDto>> {
    return this.http.get<GeneralResponse<ProfileDto>>(`${this.apiUrl}/profile`);
  }

  // Update user profile
  updateProfile(profileUpdate: ProfileUpdateDto): Observable<GeneralResponse<ProfileDto>> {
    return this.http.put<GeneralResponse<ProfileDto>>(`${this.apiUrl}/profile`, profileUpdate);
  }

  // Get user dashboard data
  getDashboard(): Observable<GeneralResponse<UserDashboardDto>> {
    return this.http.get<GeneralResponse<UserDashboardDto>>(`${this.apiUrl}/dashboard`);
  }

  // Get subscription status
  getSubscriptionStatus(): Observable<{ success: boolean; data: SubscriptionStatusDto }> {
    return this.http.get<{ success: boolean; data: SubscriptionStatusDto }>(`${this.apiUrl}/subscription-status`);
  }

  // Upload profile photo
  uploadProfilePhoto(imageFile: File): Observable<GeneralResponse<ProfileDto>> {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    return this.http.post<GeneralResponse<ProfileDto>>(`${this.apiUrl}/profile/upload-photo`, formData);
  }

  // Change password
  changePassword(currentPassword: string, newPassword: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.apiUrl}/change-password`, {
      currentPassword,
      newPassword
    });
  }

  // Upload profile image (alias for uploadProfilePhoto)
  uploadProfileImage(imageFile: File): Observable<GeneralResponse<ProfileDto>> {
    return this.uploadProfilePhoto(imageFile);
  }

  // Delete profile image
  deleteProfileImage(): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.apiUrl}/profile/photo`);
  }
}