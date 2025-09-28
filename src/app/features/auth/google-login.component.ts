import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { GoogleAuthService } from '../../core/services/google-auth.service';
import { GoogleLoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-google-login',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="google-login-container">
      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <span>{{ 'auth.signingIn' | t }}</span>
      </div>
      
      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>
      
      <div *ngIf="!loading" class="google-button-container">
        <div #googleButton></div>
      </div>
    </div>
  `,
  styles: [`
    .google-login-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .loading {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text);
      font-weight: 500;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top: 2px solid var(--brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-message {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      text-align: center;
      max-width: 300px;
    }

    .google-button-container {
      width: 100%;
      display: flex;
      justify-content: center;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class GoogleLoginComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('googleButton', { static: false }) googleButton!: ElementRef;
  
  loading = false;
  error = '';

  constructor(
    private auth: AuthService,
    private googleAuth: GoogleAuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize Google Auth when component loads
    this.googleAuth.isGoogleLoaded$.subscribe(loaded => {
      if (loaded && this.googleButton) {
        this.renderGoogleButton();
      }
    });
  }

  ngAfterViewInit(): void {
    // Render button after view is initialized
    if (this.googleAuth.isAvailable()) {
      this.renderGoogleButton();
    }
  }

  ngOnDestroy(): void {
    // Clean up Google Auth
    this.googleAuth.signOut();
  }

  private renderGoogleButton(): void {
    if (!this.googleButton?.nativeElement) return;

    try {
      this.googleAuth.renderButton(this.googleButton.nativeElement, {
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'rectangular',
        width: '100%',
        callback: (response: any) => {
          this.handleGoogleResponse(response);
        }
      });
    } catch (error) {
      console.error('Error rendering Google button:', error);
      this.error = 'خطأ في تحميل Google Sign-In';
    }
  }

  private handleGoogleResponse(response: any): void {
    if (!response.credential) {
      this.error = 'فشل في الحصول على بيانات Google';
      return;
    }

    this.loading = true;
    this.error = '';

    const googleRequest: GoogleLoginRequest = {
      idToken: response.credential
    };

    this.auth.googleLogin(googleRequest).subscribe({
      next: (result) => {
        this.loading = false;
        console.log('Google login success:', result);
        
        // Navigate to dashboard
        this.router.navigateByUrl('/dashboard');
      },
      error: (error) => {
        this.loading = false;
        console.error('Google login error:', error);
        
        if (error.error?.message) {
          this.error = error.error.message;
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'فشل في تسجيل الدخول عبر Google';
        }
      }
    });
  }
}
