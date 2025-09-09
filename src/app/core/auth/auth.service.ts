import { Injectable, inject } from '@angular/core';
import { ApiClientService } from '../services/api-client.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ForgotPasswordRequest, LoginRequest, RegisterRequest, ResetPasswordRequest, TokenResponse, UserProfile } from '../../models/auth.models';
import { TokenStorageService } from './token-storage.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClientService);
  private storage = inject(TokenStorageService);

  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  get accessToken(): string | null { return this.storage.accessToken; }

  login(req: LoginRequest): Observable<TokenResponse> {
    return this.api.post$<TokenResponse>('/Auth/login', req).pipe(
      tap(t => this.setTokens(t))
    );
  }

  register(req: RegisterRequest): Observable<TokenResponse> {
    return this.api.post$<TokenResponse>('/Auth/register', req).pipe(
      tap(t => this.setTokens(t))
    );
  }

  forgotPassword(req: ForgotPasswordRequest) {
    return this.api.post$<void>('/Auth/forgot-password', req);
  }

  resetPassword(req: ResetPasswordRequest) {
    return this.api.post$<void>('/Auth/reset-password', req);
  }

  refresh(refreshToken: string): Observable<TokenResponse> {
    return this.api.post$<TokenResponse>('/Auth/refresh', { refreshToken }).pipe(
      tap(t => this.setTokens(t))
    );
  }

  loadProfile(): Observable<UserProfile> {
    return this.api.get$<UserProfile>('/Auth/me').pipe(
      tap(u => this.currentUserSubject.next(u))
    );
  }

  logoutRequest(){
    return this.api.post$<void>('/Auth/logout', {});
  }

  changePassword(currentPassword: string, newPassword: string){
    return this.api.post$<void>('/Auth/change-password', { currentPassword, newPassword });
  }

  logout(): void {
    this.storage.clear();
    this.currentUserSubject.next(null);
  }

  private setTokens(t: TokenResponse) {
    this.storage.accessToken = t.accessToken;
    this.storage.refreshToken = t.refreshToken;
  }
}
