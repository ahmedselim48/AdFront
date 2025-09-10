import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../services/api-client.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse, UserProfile, ChangePasswordRequest, RefreshTokenRequest, ResendConfirmationRequest, VerifyEmailRequest } from '../../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClientService);
  private storage = inject(TokenStorageService);

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get accessToken(): string | null { return this.storage.accessToken; }

  login(req: LoginRequest): Observable<TokenResponse> {
    return this.api.post$<TokenResponse>('/Account/login', req).pipe(
      tap(t => this.setTokens(mapTokenResponse(t)))
    );
  }

  register(req: RegisterRequest): Observable<any> {
    // Backend expects AccountRegisterDto with userName, fullName, confirmPassword
    const payload: any = { 
      userName: req.userName, 
      fullName: req.fullName, 
      email: req.email, 
      password: req.password,
      confirmPassword: req.confirmPassword
    };
    return this.api.post$<any>('/Account/register', payload);
  }

  forgotPassword(req: ForgotPasswordRequest) {
    return this.api.post$<void>('/Account/forgot-password', { email: req.email });
  }

  resetPassword(req: ResetPasswordRequest) {
    return this.api.post$<void>('/Account/reset-password', { email: req.email, resetToken: req.resetToken, newPassword: req.newPassword });
  }

  resetPasswordByUserId(userId: string, token: string, newPassword: string) {
    return this.api.post$<void>('/Account/reset-password-by-userid', { userId, token, newPassword });
  }

  refresh(refreshToken: string): Observable<TokenResponse> {
    return this.api.post$<TokenResponse>('/Account/refresh-token', { refreshToken }).pipe(
      tap(t => this.setTokens(mapTokenResponse(t)))
    );
  }

  loadProfile(): Observable<UserProfile> {
    // Map from JWT or implement a /me endpoint later; keep as no-op for now
    return new Observable<UserProfile>(subscriber => { subscriber.next(this.currentUserSubject.value as any); subscriber.complete(); });
  }

  logoutRequest(){
    return this.api.post$<void>('/Account/logout', {} as any);
  }

  changePassword(req: ChangePasswordRequest) {
    return this.api.post$<void>('/Account/change-password', req);
  }

  verifyEmail(req: VerifyEmailRequest) {
    return this.api.get$<any>(`/Account/verify-email?token=${req.token}&email=${req.email}`);
  }

  verifyEmailByUserId(token: string, userId: string) {
    return this.api.get$<any>(`/Account/verify-email-by-userid?token=${token}&userId=${userId}`);
  }

  getUserEmail(userId: string) {
    return this.api.get$<any>(`/Account/get-user-email?userId=${userId}`);
  }

  resendConfirmation(req: ResendConfirmationRequest) {
    return this.api.post$<any>('/Account/resend-confirmation', req);
  }

  devGenerateConfirmationLink(req: ResendConfirmationRequest) {
    return this.api.post$<any>('/Account/dev-generate-confirmation-link', req);
  }

  logout(): void {
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

function mapTokenResponse(api: any): TokenResponse {
  return {
    accessToken: api?.token ?? api?.accessToken ?? '',
    refreshToken: api?.refreshToken ?? '',
    expiresIn: api?.expiration ? Math.floor((new Date(api.expiration).getTime() - Date.now()) / 1000) : api?.expiresIn ?? 3600
  } as TokenResponse;
}
