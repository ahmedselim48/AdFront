import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../services/api-client.service';
import { MockApiService } from '../services/mock-api.service';
import { BehaviorSubject, Observable, tap, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ForgotPasswordRequest, 
  LoginRequest, 
  RegisterRequest, 
  ResetPasswordRequest, 
  TokenResponse, 
  UserProfile, 
  ChangePasswordRequest, 
  ResendConfirmationRequest, 
  VerifyEmailRequest,
  GoogleLoginRequest,
  SocialLoginResponse,
  ProfileUpdateRequest,
  EmailConfirmationResponse,
  SubscriptionStatus,
  UserDashboard
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

  login(req: LoginRequest): Observable<GeneralResponse<TokenResponse>> {
    return this.api.post$<GeneralResponse<TokenResponse>>(`${this.baseUrl}/account/login`, req).pipe(
      tap(response => {
        if (response.success && response.data) {
          this.setTokens(mapTokenResponse(response.data));
        }
      })
    );
  }

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
    this.storage.clear();
    this.currentUserSubject.next(null);
    // Clear remember me settings
    localStorage.removeItem('rememberMe');
    localStorage.removeItem('loginTime');
    sessionStorage.removeItem('loginTime');
  }

  // Check if user is logged in and has valid tokens
  isLoggedIn(): boolean {
    const accessToken = this.storage.accessToken;
    const refreshToken = this.storage.refreshToken;
    
    if (!accessToken || !refreshToken) {
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
      this.loadProfile().subscribe({
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

  private setTokens(t: TokenResponse) {
    this.storage.accessToken = t.accessToken;
    this.storage.refreshToken = t.refreshToken;
  }
}

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
