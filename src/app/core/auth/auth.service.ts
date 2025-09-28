import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../services/api-client.service';
<<<<<<< HEAD
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
=======
import { MockApiService } from '../services/mock-api.service';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
import { 
  ForgotPasswordRequest, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  TokenResponse, 
  UserProfile, 
  ChangePasswordRequest, 
<<<<<<< HEAD
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
=======
  ResendConfirmationRequest, 
  VerifyEmailRequest,
  GoogleLoginRequest,
  SocialLoginResponse,
  ProfileUpdateRequest,
  EmailConfirmationResponse,
  SubscriptionStatus,
  UserDashboard
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
} from '../../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import { GeneralResponse } from '../../models/general-response';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClientService);
  private mockApi = inject(MockApiService);
  private storage = inject(TokenStorageService);
  private baseUrl = environment.apiBaseUrl;

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get accessToken(): string | null { return this.storage.accessToken; }
  
  get currentUser(): UserProfile | null { return this.currentUserSubject.value; }

<<<<<<< HEAD
  // ===== AUTHENTICATION METHODS =====

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.api.post$<AuthResponse>('/Account/login', req).pipe(
      tap(response => {
        this.setTokensFromAuthResponse(response);
        this.currentUserSubject.next(response.user);
=======
  login(req: LoginRequest): Observable<GeneralResponse<TokenResponse>> {
    return this.api.post$<GeneralResponse<TokenResponse>>(`${this.baseUrl}/account/login`, req).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(mapTokenResponse(response.data));
        }
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
      })
    );
  }

<<<<<<< HEAD
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
=======
  register(req: RegisterRequest): Observable<GeneralResponse<TokenResponse>> {
    return this.api.post$<GeneralResponse<TokenResponse>>(`${this.baseUrl}/account/register`, req);
  }

  registerWithoutEmail(req: RegisterRequest): Observable<GeneralResponse<TokenResponse>> {
    return this.api.post$<GeneralResponse<TokenResponse>>(`${this.baseUrl}/account/register-without-email`, req);
  }

  googleLogin(req: GoogleLoginRequest): Observable<GeneralResponse<SocialLoginResponse>> {
    return this.api.post$<GeneralResponse<SocialLoginResponse>>(`${this.baseUrl}/account/google-login`, req).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(mapTokenResponse(response.data));
          this.currentUserSubject.next(response.data.user);
        }
      })
    );
  }

  forgotPassword(req: ForgotPasswordRequest): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/account/forgot-password`, req);
  }

  resetPassword(req: ResetPasswordRequest): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/account/reset-password`, req);
  }

  changePassword(req: ChangePasswordRequest): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/account/change-password`, req);
  }

  resendConfirmation(req: ResendConfirmationRequest): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/account/resend-confirmation`, req);
  }

  confirmEmail(req: VerifyEmailRequest): Observable<GeneralResponse<EmailConfirmationResponse>> {
    return this.api.post$<GeneralResponse<EmailConfirmationResponse>>(`${this.baseUrl}/account/confirm-email`, req);
  }

  logout(): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/account/logout`, {}).pipe(
      tap(() => {
        this.storage.clear();
        this.currentUserSubject.next(null);
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('loginTime');
        sessionStorage.removeItem('loginTime');
      })
    );
  }

  getSubscriptionStatus(): Observable<GeneralResponse<SubscriptionStatus>> {
    if (environment.production) {
      return this.api.get$<GeneralResponse<SubscriptionStatus>>('/api/account/subscription-status');
    } else {
      // Mock data for development
      return this.mockApi.getSubscriptionStatus();
    }
  }

  getDashboard(): Observable<GeneralResponse<UserDashboard>> {
    if (environment.production) {
      return this.api.get$<GeneralResponse<UserDashboard>>('/api/account/dashboard');
    } else {
      // Mock data for development
      return this.mockApi.getDashboard();
    }
  }

  updateProfile(req: ProfileUpdateRequest): Observable<GeneralResponse<UserProfile>> {
    return this.api.put$<GeneralResponse<UserProfile>>('/api/account/dashboard', req).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.currentUserSubject.next(response.data);
        }
      })
    );
  }

  loadProfile(): Observable<UserProfile> {
    // Map from JWT or implement a /me endpoint later; keep as no-op for now
    return new Observable<UserProfile>(subscriber => { 
      const currentUser = this.currentUserSubject.value;
      if (currentUser) {
        subscriber.next(currentUser); 
      } else {
        subscriber.error('No user profile available');
      }
      subscriber.complete(); 
    });
  }

  logoutLocal(): void {
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
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
<<<<<<< HEAD
=======

interface TokenApiResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  expiration?: string | number;
  expiresIn?: number;
}

function mapTokenResponse(api: TokenApiResponse): TokenResponse {
  return {
    accessToken: api?.token ?? api?.accessToken ?? '',
    refreshToken: api?.refreshToken ?? '',
    expiresIn: api?.expiration ? Math.floor((new Date(api.expiration).getTime() - Date.now()) / 1000) : api?.expiresIn ?? 3600
  } as TokenResponse;
}
>>>>>>> 51bb64ae2cfdd3a2477bdefc0d36fd34dddcd707
