import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { UserProfile, UpdateProfileRequest, SubscriptionStatus } from '../../models/auth.models';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private api = inject(ApiClientService);
  
  private currentProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  currentProfile$ = this.currentProfileSubject.asObservable();

  // ===== PROFILE MANAGEMENT =====

  /**
   * Get current user profile
   */
  getProfile(): Observable<UserProfile> {
    return this.api.get$<UserProfile>('/Account/profile').pipe(
      tap(profile => this.currentProfileSubject.next(profile))
    );
  }

  /**
   * Update user profile
   */
  updateProfile(request: UpdateProfileRequest): Observable<UserProfile> {
    return this.api.put$<UserProfile>('/Account/profile', request).pipe(
      tap(profile => this.currentProfileSubject.next(profile))
    );
  }

  /**
   * Get user subscription status
   */
  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.api.get$<SubscriptionStatus>('/Account/subscription-status');
  }

  /**
   * Upload profile image
   */
  uploadProfileImage(file: File): Observable<{ profileImageUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.api.post$<{ profileImageUrl: string }>('/Account/upload-profile-image', formData);
  }

  /**
   * Delete profile image
   */
  deleteProfileImage(): Observable<boolean> {
    return this.api.delete$<boolean>('/Account/profile-image');
  }

  // ===== UTILITY METHODS =====

  /**
   * Get current profile from memory
   */
  getCurrentProfile(): UserProfile | null {
    return this.currentProfileSubject.value;
  }

  /**
   * Clear profile data
   */
  clearProfile(): void {
    this.currentProfileSubject.next(null);
  }

  /**
   * Refresh profile data
   */
  refreshProfile(): Observable<UserProfile> {
    return this.getProfile();
  }
}

// Import tap operator
import { tap } from 'rxjs/operators';
