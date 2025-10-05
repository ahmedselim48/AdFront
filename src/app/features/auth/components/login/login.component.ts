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
      <div class="login-wrapper">
        <div class="login-card">
          <!-- Header -->
          <div class="login-header">
            <div class="logo">HarajPlus</div>
            <h1 class="title">تسجيل الدخول</h1>
            <p class="subtitle">أدخل بياناتك للوصول إلى حسابك</p>
          </div>

          <!-- Form -->
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
            <!-- Email Field -->
            <div class="form-group">
              <label class="form-label">البريد الإلكتروني أو اسم المستخدم</label>
              <mat-form-field appearance="outline" class="form-field">
                <input
                  matInput
                  type="text"
                  formControlName="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  autocomplete="email">
                <mat-icon matPrefix class="input-icon">
                  <lucide-icon name="mail" size="18"></lucide-icon>
                </mat-icon>
                <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                  هذا الحقل مطلوب
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                  يرجى إدخال بريد إلكتروني صحيح
                </mat-error>
                <mat-error *ngIf="loginForm.get('email')?.hasError('invalidEmailOrUsername')">
                  يرجى إدخال بريد إلكتروني أو اسم مستخدم صحيح
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Password Field -->
            <div class="form-group">
              <label class="form-label">كلمة المرور</label>
              <mat-form-field appearance="outline" class="form-field">
                <input
                  matInput
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="password"
                  placeholder="أدخل كلمة المرور"
                  autocomplete="current-password">
                <mat-icon matPrefix class="input-icon">
                  <lucide-icon name="lock" size="18"></lucide-icon>
                </mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  class="visibility-toggle">
                  <mat-icon>
                    <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" size="18"></lucide-icon>
                  </mat-icon>
                </button>
                <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                  هذا الحقل مطلوب
                </mat-error>
                <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                  كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </mat-error>
              </mat-form-field>
            </div>

            <!-- Options Row -->
            <div class="options-row">
              <mat-checkbox formControlName="rememberMe" class="checkbox">
                تذكرني
              </mat-checkbox>
              <a routerLink="/auth/forgot-password" class="forgot-link">
                نسيت كلمة المرور؟
              </a>
            </div>

            <!-- Error Alert -->
            <div class="alert alert-error" *ngIf="errorMessage">
              <lucide-icon name="alert-circle" size="16" class="alert-icon"></lucide-icon>
              <span>{{ errorMessage }}</span>
            </div>

            <!-- Submit Button -->
            <button
              mat-flat-button
              color="primary"
              type="submit"
              class="submit-btn"
              [disabled]="loginForm.invalid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="18" class="btn-spinner"></mat-spinner>
              <span *ngIf="!isLoading">تسجيل الدخول</span>
            </button>

            <!-- Divider -->
            <div class="divider">
              <span>أو</span>
            </div>

            <!-- Google Button -->
            <button
              mat-stroked-button
              type="button"
              class="google-btn"
              (click)="loginWithGoogle()"
              [disabled]="isLoading">
              <lucide-icon name="globe" size="18"></lucide-icon>
              <span>تسجيل الدخول بواسطة Google</span>
            </button>

            <!-- Register Link -->
            <div class="footer-text">
              ليس لديك حساب؟ 
              <a routerLink="/auth/register" class="link">إنشاء حساب جديد</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container */
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 1.5rem;
    }

    .login-wrapper {
      width: 100%;
      max-width: 420px;
    }

    .login-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 2.5rem;
    }

    /* Header */
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: inline-block;
      font-size: 1.25rem;
      font-weight: 700;
      color: #1a73e8;
      margin-bottom: 1.5rem;
      letter-spacing: -0.5px;
    }

    .title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #202124;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.5px;
    }

    .subtitle {
      font-size: 0.9375rem;
      color: #5f6368;
      margin: 0;
      line-height: 1.5;
    }

    /* Form */
    .login-form {
      display: flex;
      flex-direction: column;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #202124;
      margin-bottom: 0.5rem;
    }

    .form-field {
      width: 100%;
    }

    /* Material Field Customization */
    :host ::ng-deep .form-field .mat-mdc-text-field-wrapper {
      background-color: #ffffff;
    }

    :host ::ng-deep .form-field .mdc-notched-outline__leading,
    :host ::ng-deep .form-field .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field .mdc-notched-outline__notch {
      border-color: #dadce0;
    }

    :host ::ng-deep .form-field:hover .mdc-notched-outline__leading,
    :host ::ng-deep .form-field:hover .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field:hover .mdc-notched-outline__notch {
      border-color: #202124;
    }

    :host ::ng-deep .form-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .form-field.mat-focused .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field.mat-focused .mdc-notched-outline__notch {
      border-color: #1a73e8 !important;
      border-width: 2px !important;
    }

    :host ::ng-deep .form-field .mat-mdc-form-field-icon-prefix {
      color: #5f6368;
      padding-right: 0.75rem;
    }

    :host ::ng-deep .form-field.mat-focused .mat-mdc-form-field-icon-prefix {
      color: #1a73e8;
    }

    :host ::ng-deep .form-field input {
      font-size: 0.9375rem;
      color: #202124;
    }

    :host ::ng-deep .form-field input::placeholder {
      color: #80868b;
    }

    :host ::ng-deep .form-field .mat-mdc-form-field-error {
      font-size: 0.75rem;
      color: #d93025;
    }

    .input-icon {
      display: flex;
      align-items: center;
    }

    .visibility-toggle {
      color: #5f6368;
    }

    .visibility-toggle:hover {
      color: #202124;
    }

    /* Options Row */
    .options-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .checkbox {
      font-size: 0.875rem;
      color: #202124;
    }

    :host ::ng-deep .checkbox .mdc-checkbox__background {
      border-color: #dadce0;
    }

    :host ::ng-deep .checkbox.mat-mdc-checkbox-checked .mdc-checkbox__background {
      background-color: #1a73e8;
      border-color: #1a73e8;
    }

    .forgot-link {
      font-size: 0.875rem;
      color: #1a73e8;
      text-decoration: none;
      font-weight: 500;
    }

    .forgot-link:hover {
      text-decoration: underline;
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
      margin-bottom: 1.5rem;
    }

    .alert-error {
      background-color: #fce8e6;
      color: #d93025;
      border: 1px solid #f4c7c3;
    }

    .alert-icon {
      flex-shrink: 0;
    }

    /* Submit Button */
    .submit-btn {
      width: 100%;
      height: 48px;
      font-size: 0.9375rem;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.25px;
      border-radius: 6px;
      background-color: #1a73e8;
      color: #ffffff;
      box-shadow: none;
      margin-bottom: 1.5rem;
    }

    .submit-btn:hover:not(:disabled) {
      background-color: #1765cc;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
    }

    .submit-btn:disabled {
      background-color: #dadce0;
      color: #80868b;
    }

    .btn-spinner {
      display: inline-block;
      margin: 0 auto;
    }

    :host ::ng-deep .submit-btn .mat-mdc-button-touch-target {
      height: 48px;
    }

    /* Divider */
    .divider {
      position: relative;
      text-align: center;
      margin: 1.5rem 0;
    }

    .divider::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 1px;
      background-color: #dadce0;
    }

    .divider span {
      position: relative;
      display: inline-block;
      background-color: #ffffff;
      padding: 0 1rem;
      font-size: 0.875rem;
      color: #5f6368;
    }

    /* Google Button */
    .google-btn {
      width: 100%;
      height: 48px;
      font-size: 0.9375rem;
      font-weight: 500;
      text-transform: none;
      letter-spacing: 0.25px;
      border-radius: 6px;
      border: 1px solid #dadce0;
      color: #202124;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .google-btn:hover:not(:disabled) {
      background-color: #f8f9fa;
      border-color: #d2d3d4;
    }

    :host ::ng-deep .google-btn .mat-mdc-button-touch-target {
      height: 48px;
    }

    /* Footer Text */
    .footer-text {
      text-align: center;
      font-size: 0.875rem;
      color: #5f6368;
      padding-top: 0.5rem;
    }

    .link {
      color: #1a73e8;
      text-decoration: none;
      font-weight: 500;
    }

    .link:hover {
      text-decoration: underline;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .login-container {
        padding: 1rem;
      }

      .login-card {
        padding: 2rem 1.5rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.875rem;
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
      email: ['', [Validators.required, this.emailOrUsernameValidator]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // Custom validator for email or username
  emailOrUsernameValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const value = control.value.trim();
    
    // Check if it's a valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(value)) {
      return null; // Valid email
    }
    
    // Check if it's a valid username (2-32 chars, letters, numbers, _, ., -)
    const usernameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9_.-]{2,32}$/;
    if (usernameRegex.test(value)) {
      return null; // Valid username
    }
    
    return { invalidEmailOrUsername: true };
  }

  ngOnInit() {
    // Check if user is already logged in and redirect based on role
    if (this.authService.isLoggedIn()) {
      this.authService.getProfile().subscribe({
        next: (profile) => {
          const isAdmin = Array.isArray(profile.roles) && profile.roles.includes('Admin');
          this.router.navigate([isAdmin ? '/admin/dashboard' : '/home']);
        },
        error: () => {
          // If failing to load profile, stay on login
        }
      });
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
          const roles = response?.user?.roles || [];
          const isAdmin = Array.isArray(roles) && roles.includes('Admin');
          this.router.navigate([isAdmin ? '/admin/dashboard' : '/profile']);
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