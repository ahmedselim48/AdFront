import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Globe } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { LoginRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <div class="login-container">
      <div class="login-card">
        <mat-card class="login-mat-card">
          <mat-card-header>
            <div class="login-header">
              <lucide-icon name="log-in" size="32" class="login-icon"></lucide-icon>
              <h2 class="login-title">تسجيل الدخول</h2>
              <p class="login-subtitle">مرحباً بك في HarajPlus</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
              <!-- Email Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>البريد الإلكتروني</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  autocomplete="email"
                  class="form-input">
                <mat-icon matPrefix>
                  <lucide-icon name="mail" size="20"></lucide-icon>
                </mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  البريد الإلكتروني مطلوب
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  يرجى إدخال بريد إلكتروني صحيح
                </mat-error>
              </mat-form-field>

              <!-- Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>كلمة المرور</mat-label>
                <input
                  matInput
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="أدخل كلمة المرور"
                  autocomplete="current-password"
                  class="form-input">
                <mat-icon matPrefix>
                  <lucide-icon name="lock" size="20"></lucide-icon>
                </mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="'إظهار كلمة المرور'"
                  [attr.aria-pressed]="showPassword">
                  <mat-icon>
                    <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" size="20"></lucide-icon>
                  </mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  كلمة المرور مطلوبة
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </mat-error>
              </mat-form-field>

              <!-- Remember Me & Forgot Password -->
              <div class="login-options">
                <mat-checkbox formControlName="rememberMe" class="remember-me">
                  تذكرني
                </mat-checkbox>
                <a routerLink="/auth/forgot-password" class="forgot-password">
                  نسيت كلمة المرور؟
                </a>
              </div>

              <!-- Error Message -->
              <div class="error-message" *ngIf="errorMessage">
                <mat-icon class="error-icon">
                  <lucide-icon name="alert-circle" size="20"></lucide-icon>
                </mat-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Submit Button -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="login-button full-width"
                [disabled]="loginForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="login-spinner"></mat-spinner>
                <lucide-icon *ngIf="!isLoading" name="log-in" size="20" class="me-2"></lucide-icon>
                <span *ngIf="!isLoading">تسجيل الدخول</span>
              </button>

              <!-- Divider -->
              <div class="divider">
                <span>أو</span>
              </div>

              <!-- Google Login -->
              <button
                mat-stroked-button
                type="button"
                class="google-login-button full-width"
                (click)="loginWithGoogle()"
                [disabled]="isLoading">
                <lucide-icon name="globe" size="20" class="google-icon"></lucide-icon>
                تسجيل الدخول بـ Google
              </button>

              <!-- Register Link -->
              <div class="register-link">
                <p>ليس لديك حساب؟ <a routerLink="/auth/register">إنشاء حساب جديد</a></p>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }

    .login-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 200, 255, 0.2) 0%, transparent 50%);
      z-index: 0;
    }

    .login-card {
      width: 100%;
      max-width: 450px;
      position: relative;
      z-index: 1;
    }

    .login-mat-card {
      padding: 3rem;
      border-radius: 1.5rem;
      box-shadow: 
        0 20px 40px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .login-icon {
      color: #667eea;
      margin-bottom: 1rem;
      filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
    }

    .login-title {
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.5rem 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .login-subtitle {
      color: #666;
      margin: 0;
      font-size: 1rem;
      font-weight: 400;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .login-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: -0.5rem 0;
    }

    .remember-me {
      font-size: 0.9rem;
    }

    .forgot-password {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .forgot-password:hover {
      color: #5a6fd8;
      text-decoration: underline;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #d32f2f;
      background: linear-gradient(135deg, #ffebee, #fce4ec);
      padding: 1rem 1.25rem;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 500;
      border: 1px solid rgba(211, 47, 47, 0.2);
      box-shadow: 
        0 2px 8px rgba(211, 47, 47, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      margin: 1rem 0;
    }

    .error-icon {
      color: #f44336;
    }

    .login-button {
      height: 56px;
      font-size: 1.1rem;
      font-weight: 600;
      margin-top: 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 12px;
      box-shadow: 
        0 4px 15px rgba(102, 126, 234, 0.4),
        0 2px 4px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      text-transform: none;
      letter-spacing: 0.5px;
    }

    .login-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.5),
        0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .login-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .login-button:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: 
        0 2px 8px rgba(102, 126, 234, 0.2),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .login-spinner {
      margin-left: 0.5rem;
    }

    .divider {
      text-align: center;
      position: relative;
      margin: 1rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #e0e0e0;
    }

    .divider span {
      background-color: white;
      padding: 0 1rem;
      color: #666;
      font-size: 0.9rem;
    }

    .google-login-button {
      height: 56px;
      font-size: 1rem;
      font-weight: 600;
      border: 2px solid rgba(102, 126, 234, 0.2);
      color: #3c4043;
      background: rgba(255, 255, 255, 0.8);
      border-radius: 12px;
      transition: all 0.3s ease;
      text-transform: none;
      letter-spacing: 0.5px;
    }

    .google-login-button:hover:not(:disabled) {
      border-color: rgba(102, 126, 234, 0.4);
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .google-icon {
      margin-left: 0.5rem;
    }

    .register-link {
      text-align: center;
      margin-top: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      border-radius: 12px;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .register-link p {
      margin: 0;
      color: #555;
      font-size: 1rem;
      font-weight: 400;
    }

    .register-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      transition: all 0.3s ease;
      position: relative;
    }

    .register-link a:hover {
      text-decoration: none;
      filter: brightness(1.2);
    }

    .register-link a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }

    .register-link a:hover::after {
      width: 100%;
    }

    @media (max-width: 768px) {
      .login-container {
        padding: 1rem;
      }

      .login-mat-card {
        padding: 2rem;
      }

      .login-title {
        font-size: 1.75rem;
      }
    }

    @media (max-width: 480px) {
      .login-container {
        padding: 0.5rem;
      }

      .login-mat-card {
        padding: 1.5rem;
        border-radius: 1rem;
      }

      .login-title {
        font-size: 1.5rem;
      }

      .login-button {
        height: 50px;
        font-size: 1rem;
      }

      .google-login-button {
        height: 50px;
        font-size: 0.95rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const loginRequest: LoginRequest = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password,
        rememberMe: this.loginForm.value.rememberMe
      };

      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('تم تسجيل الدخول بنجاح', 'مرحباً');
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء تسجيل الدخول';
          this.toastr.error(this.errorMessage, 'خطأ');
        }
      });
    }
  }

  loginWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';

    // This would typically open a popup or redirect to Google OAuth
    // For now, we'll show a message
    this.toastr.info('ميزة تسجيل الدخول بـ Google قيد التطوير', 'قريباً');
    this.isLoading = false;
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
