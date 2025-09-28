import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../services/api-client.service';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import { 
  ForgotPasswordRequest, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  TokenResponse, 
  UserProfile, 
  ChangePasswordRequest, 
  RefreshTokenRequest, 
  ResendConfirmationRequest, 
  VerifyEmailRequest,
  AuthResponse,
  SocialLoginResponse,
  GoogleLoginRequest,
  ConfirmEmailRequest,
  UpdateProfileRequest,
  EmailConfirmationResponse,
  SubscriptionStatus,
  UserDashboardDto
} from '../../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClientService);
  private storage = inject(TokenStorageService);

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get accessToken(): string | null { return this.storage.accessToken; }

  // ===== AUTHENTICATION METHODS =====

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.api.post$<AuthResponse>('/Account/login', req).pipe(
      tap(response => {
        this.setTokensFromAuthResponse(response);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.api.post$<AuthResponse>('/Account/register', req).pipe(
      tap(response => {
        this.setTokensFromAuthResponse(response);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  registerWithoutEmail(req: RegisterRequest): Observable<AuthResponse> {
    return this.api.post$<AuthResponse>('/Account/register-without-email', req).pipe(
      tap(response => {
        this.setTokensFromAuthResponse(response);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  googleLogin(req: GoogleLoginRequest): Observable<SocialLoginResponse> {
    return this.api.post$<SocialLoginResponse>('/Account/google-login', req).pipe(
      tap(response => {
        this.setTokensFromSocialLoginResponse(response);
        this.currentUserSubject.next(response.user);
      })
    );
  }

  logout(): Observable<boolean> {
    return this.api.post$<boolean>('/Account/logout', {}).pipe(
      tap(() => {
        this.storage.clear();
        this.currentUserSubject.next(null);
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('loginTime');
        sessionStorage.removeItem('loginTime');
      })
    );
  }

  // ===== PASSWORD MANAGEMENT =====

  forgotPassword(req: ForgotPasswordRequest): Observable<boolean> {
    return this.api.post$<boolean>('/Account/forgot-password', req);
  }

  resetPassword(req: ResetPasswordRequest): Observable<boolean> {
    return this.api.post$<boolean>('/Account/reset-password', req);
  }

  changePassword(req: ChangePasswordRequest): Observable<boolean> {
    return this.api.post$<boolean>('/Account/change-password', req);
  }

  // ===== EMAIL CONFIRMATION =====

  resendConfirmation(req: ResendConfirmationRequest): Observable<boolean> {
    return this.api.post$<boolean>('/Account/resend-confirmation', req);
  }

  confirmEmail(req: ConfirmEmailRequest): Observable<EmailConfirmationResponse> {
    return this.api.post$<EmailConfirmationResponse>('/Account/confirm-email', req);
  }

  // ===== PROFILE MANAGEMENT =====

  getProfile(): Observable<UserProfile> {
    return this.api.get$<UserProfile>('/Account/profile').pipe(
      tap(profile => this.currentUserSubject.next(profile))
    );
  }

  updateProfileViaDashboard(req: UpdateProfileRequest): Observable<UserProfile> {
    return this.api.put$<UserProfile>('/Account/dashboard', req).pipe(
      tap(profile => this.currentUserSubject.next(profile))
    );
  }

  getSubscriptionStatus(): Observable<SubscriptionStatus> {
    return this.api.get$<SubscriptionStatus>('/Account/subscription-status');
  }

  // ===== DASHBOARD METHODS =====

  getMyDashboard(): Observable<UserDashboardDto> {
    return this.api.get$<UserDashboardDto>('/Account/dashboard');
  }

  // ===== PROFILE IMAGE METHODS =====

  uploadProfileImage(imageFile: File): Observable<UserProfile> {
    const formData = new FormData();
    formData.append('imageFile', imageFile);
    
    return this.api.post$<UserProfile>('/Account/profile/upload-photo', formData, {
      headers: {
        // Don't set Content-Type, let browser set it with boundary
      }
    }).pipe(
      tap(profile => this.currentUserSubject.next(profile))
    );
  }

  deleteProfileImage(): Observable<boolean> {
    return this.api.delete$<boolean>('/Account/profile/photo');
  }


  // ===== LEGACY METHODS (for backward compatibility) =====

  loadProfile(): Observable<UserProfile> {
    return this.getProfile();
  }

  logoutRequest(): Observable<boolean> {
    return this.logout();
  }

  verifyEmail(req: VerifyEmailRequest): Observable<any> {
    const confirmReq: ConfirmEmailRequest = {
      userId: '', // This would need to be provided
      token: req.token
    };
    return this.confirmEmail(confirmReq);
  }

  verifyEmailByUserId(token: string, userId: string): Observable<any> {
    const confirmReq: ConfirmEmailRequest = {
      userId: userId,
      token: token
    };
    return this.confirmEmail(confirmReq);
  }

  getUserEmail(userId: string): Observable<any> {
    // This endpoint doesn't exist in the backend, return empty
    return new Observable(subscriber => {
      subscriber.next({ email: '' });
      subscriber.complete();
    });
  }

  devGenerateConfirmationLink(req: ResendConfirmationRequest): Observable<any> {
    // This endpoint doesn't exist in the backend, use resendConfirmation
    return this.resendConfirmation(req);
  }

  resetPasswordByUserId(userId: string, token: string, newPassword: string): Observable<any> {
    const req: ResetPasswordRequest = {
      email: '', // This would need to be provided
      token: token,
      newPassword: newPassword
    };
    return this.resetPassword(req);
  }

  refresh(refreshToken: string): Observable<TokenResponse> {
    // This endpoint doesn't exist in the backend, return empty
    return new Observable(subscriber => {
      subscriber.next({
        accessToken: '',
        refreshToken: '',
        expiresIn: 0
      });
      subscriber.complete();
    });
  }

  // ===== UTILITY METHODS =====

  // Clear all local data (for logout)
  clearLocalData(): void {
    this.storage.clear();
    this.currentUserSubject.next(null);
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loginTime');
    sessionStorage.removeItem('loginTime');
  }

  // Check if user is logged in and has valid tokens
  isLoggedIn(): boolean {
    const accessToken = this.storage.accessToken;
    
    if (!accessToken) {
      return false;
    }
    
    // Check if access token is expired
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    } catch {
      return false;
    }
  }

  // Initialize auth state from stored tokens
  initializeAuth(): void {
    if (this.isLoggedIn()) {
      // Try to load user profile
      this.getProfile().subscribe({
        next: (profile) => {
          this.currentUserSubject.next(profile);
        },
        error: () => {
          // If profile loading fails, clear tokens
          this.logout();
        }
      });
    }
  }

  // Save login state
  saveLoginState(rememberMe: boolean = false): void {
    if (rememberMe) {
      localStorage.setItem('rememberMe', 'true');
      localStorage.setItem('loginTime', Date.now().toString());
    } else {
      sessionStorage.setItem('loginTime', Date.now().toString());
    }
  }

  // Check if login should be remembered
  shouldRememberLogin(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // Get current user
  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  // ===== PRIVATE HELPER METHODS =====

  private setTokensFromAuthResponse(response: AuthResponse) {
    this.storage.accessToken = response.token;
    // AuthResponse doesn't provide refreshToken, so we don't set it
  }

  private setTokensFromSocialLoginResponse(response: SocialLoginResponse) {
    this.storage.accessToken = response.token;
    this.storage.refreshToken = response.refreshToken;
  }
}
