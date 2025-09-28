import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { ConfirmEmailRequest } from '../../models/auth.models';

@Component({
  selector: 'app-confirm-email',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="confirmation-container">
      <div class="confirmation-card" [class.success]="isSuccess" [class.error]="isError">
        <div class="icon-container">
          <i class="icon" [class.icon-success]="isSuccess" [class.icon-error]="isError"></i>
        </div>
        
        <h2 *ngIf="isSuccess">{{ 'auth.emailConfirmedTitle' | t }}</h2>
        <h2 *ngIf="isError">{{ 'auth.emailConfirmationFailedTitle' | t }}</h2>
        <h2 *ngIf="!isSuccess && !isError && !isLoading">{{ 'auth.emailConfirmationPendingTitle' | t }}</h2>
        
        <p *ngIf="isSuccess" class="success-message">
          {{ 'auth.emailConfirmedMessage' | t }}
        </p>
        
        <p *ngIf="isError" class="error-message">
          {{ errorMessage }}
        </p>
        
        <p *ngIf="!isSuccess && !isError && !isLoading" class="pending-message">
          {{ 'auth.emailConfirmationPendingMessage' | t }}
        </p>
        
        <div *ngIf="isLoading" class="loading">
          <div class="spinner"></div>
          <span>{{ 'auth.confirmingEmail' | t }}</span>
        </div>
        
        <div class="actions" *ngIf="isSuccess || isError">
          <button class="btn-primary" (click)="goToLogin()">
            {{ 'auth.goToLogin' | t }}
          </button>
          <button *ngIf="isError" class="btn-secondary" (click)="resendConfirmation()">
            {{ 'auth.resendConfirmation' | t }}
          </button>
        </div>
        
        <div class="help-text" *ngIf="isError">
          <p>{{ 'auth.confirmationErrorHelp' | t }}</p>
          <p>{{ 'auth.contactSupport' | t }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 2rem;
    }

    .confirmation-card {
      max-width: 500px;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      box-shadow: var(--shadow);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .confirmation-card.success {
      border-color: var(--accent);
      background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.02));
    }

    .confirmation-card.error {
      border-color: var(--danger);
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(239, 68, 68, 0.02));
    }

    .confirmation-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: var(--gradient);
    }

    .confirmation-card.success::before {
      background: linear-gradient(135deg, #10b981, #059669);
    }

    .confirmation-card.error::before {
      background: linear-gradient(135deg, #ef4444, #dc2626);
    }

    .icon-container {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      transition: all 0.3s ease;
    }

    .icon-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
    }

    .icon-success::before {
      content: '✓';
    }

    .icon-error {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
    }

    .icon-error::before {
      content: '✗';
    }

    .icon::before {
      font-weight: bold;
    }

    h2 {
      color: var(--text);
      font-size: 1.5rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }

    .success-message {
      color: var(--accent);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    .error-message {
      color: var(--danger);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      font-weight: 500;
    }

    .pending-message {
      color: var(--muted);
      font-size: 1.1rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      color: var(--text);
      font-weight: 500;
      margin-bottom: 2rem;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top: 2px solid var(--brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: var(--gradient);
      color: white;
    }

    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--muted-bg);
    }

    .help-text {
      color: var(--muted);
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .help-text p {
      margin: 0.5rem 0;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 480px) {
      .confirmation-container {
        padding: 1rem;
      }

      .confirmation-card {
        padding: 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      .btn-primary, .btn-secondary {
        width: 100%;
      }
    }
  `]
})
export class ConfirmEmailComponent implements OnInit {
  isLoading = true;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  private userId = '';
  private token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // Check for success/error from Backend redirect
    const success = this.route.snapshot.queryParamMap.get('success');
    const error = this.route.snapshot.queryParamMap.get('error');
    
    if (success === 'true') {
      this.isSuccess = true;
      this.isLoading = false;
      return;
    }
    
    if (error) {
      this.isError = true;
      this.isLoading = false;
      this.errorMessage = decodeURIComponent(error);
      return;
    }
    
    // Get parameters from URL for direct API call
    this.userId = this.route.snapshot.queryParamMap.get('userId') || '';
    this.token = this.route.snapshot.queryParamMap.get('token') || '';

    if (!this.userId || !this.token) {
      this.isError = true;
      this.isLoading = false;
      this.errorMessage = 'رابط التأكيد غير صالح أو ناقص';
      return;
    }

    // Decode URL-encoded token
    try {
      this.token = decodeURIComponent(this.token);
    } catch (e) {
      console.warn('Failed to decode token, using as-is:', e);
    }

    console.log('Confirming email with userId:', this.userId, 'token length:', this.token.length);
    this.confirmEmail();
  }

  private confirmEmail(): void {
    const request: ConfirmEmailRequest = {
      userId: this.userId,
      token: this.token
    };

    console.log('Sending confirmation request:', { userId: request.userId, tokenLength: request.token.length });

    this.authService.confirmEmail(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.isSuccess = true;
        console.log('Email confirmed successfully:', response);
        
        // If we have auth data, store the token and redirect
        if (response.authData?.token) {
          // Store the JWT token
          localStorage.setItem('access_token', response.authData.token);
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            this.router.navigateByUrl('/dashboard');
          }, 2000);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.isError = true;
        console.error('Email confirmation error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        
        if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.error?.errors && error.error.errors.length > 0) {
          this.errorMessage = error.error.errors[0];
        } else if (error.message) {
          this.errorMessage = error.message;
        } else {
          this.errorMessage = 'فشل في تأكيد البريد الإلكتروني';
        }
      }
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }

  resendConfirmation(): void {
    this.router.navigateByUrl('/auth/resend-confirmation');
  }
}
