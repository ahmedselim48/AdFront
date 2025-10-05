import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Lock, Eye, EyeOff, CheckCircle, ArrowLeft } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { ResetPasswordRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <div class="reset-password-container">
      <div class="reset-password-card">
        <mat-card class="reset-password-mat-card">
          <mat-card-header>
            <div class="reset-password-header">
              <div class="icon-wrapper">
                <lucide-icon name="lock" [size]="28" class="reset-password-icon"></lucide-icon>
              </div>
              <h2 class="reset-password-title">إعادة تعيين كلمة المرور</h2>
              <p class="reset-password-subtitle">أدخل كلمة المرور الجديدة الخاصة بك</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Success State -->
            <div *ngIf="isSuccess" class="success-state">
              <div class="success-icon-wrapper">
                <lucide-icon name="check-circle" [size]="56" class="success-icon"></lucide-icon>
              </div>
              <h3 class="success-title">تم تغيير كلمة المرور بنجاح!</h3>
              <p class="success-message">
                تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.
              </p>
              <div class="success-actions">
                <button mat-raised-button color="primary" (click)="goToLogin()" class="login-button">
                  تسجيل الدخول
                </button>
              </div>
            </div>

            <!-- Form State -->
            <form *ngIf="!isSuccess" [formGroup]="resetPasswordForm" (ngSubmit)="onSubmit()" class="reset-password-form">
              <!-- Email Field (Disabled) -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>البريد الإلكتروني</mat-label>
                <input
                  matInput
                  type="email"
                  [value]="email"
                  disabled>
                <mat-icon matPrefix>
                  <lucide-icon name="mail" [size]="20"></lucide-icon>
                </mat-icon>
              </mat-form-field>

              <!-- New Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>كلمة المرور الجديدة</mat-label>
                <input
                  matInput
                  [type]="showPassword ? 'text' : 'password'"
                  formControlName="newPassword"
                  placeholder="أدخل كلمة المرور الجديدة"
                  autocomplete="new-password">
                <mat-icon matPrefix>
                  <lucide-icon name="lock" [size]="20"></lucide-icon>
                </mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="togglePasswordVisibility()"
                  [attr.aria-label]="'إظهار كلمة المرور'">
                  <mat-icon>
                    <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" [size]="20"></lucide-icon>
                  </mat-icon>
                </button>
                <mat-error *ngIf="resetPasswordForm.get('newPassword')?.hasError('required')">
                  كلمة المرور الجديدة مطلوبة
                </mat-error>
                <mat-error *ngIf="resetPasswordForm.get('newPassword')?.hasError('minlength')">
                  كلمة المرور يجب أن تكون 6 أحرف على الأقل
                </mat-error>
              </mat-form-field>

              <!-- Confirm Password Field -->
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>تأكيد كلمة المرور الجديدة</mat-label>
                <input
                  matInput
                  [type]="showConfirmPassword ? 'text' : 'password'"
                  formControlName="confirmPassword"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                  autocomplete="new-password">
                <mat-icon matPrefix>
                  <lucide-icon name="lock" [size]="20"></lucide-icon>
                </mat-icon>
                <button
                  mat-icon-button
                  matSuffix
                  type="button"
                  (click)="toggleConfirmPasswordVisibility()"
                  [attr.aria-label]="'إظهار تأكيد كلمة المرور'">
                  <mat-icon>
                    <lucide-icon [name]="showConfirmPassword ? 'eye-off' : 'eye'" [size]="20"></lucide-icon>
                  </mat-icon>
                </button>
                <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('required')">
                  تأكيد كلمة المرور مطلوب
                </mat-error>
                <mat-error *ngIf="resetPasswordForm.get('confirmPassword')?.hasError('mismatch')">
                  كلمة المرور غير متطابقة
                </mat-error>
              </mat-form-field>

              <!-- Error Message -->
              <div class="error-message" *ngIf="errorMessage">
                <mat-icon class="error-icon">
                  <lucide-icon name="alert-circle" [size]="18"></lucide-icon>
                </mat-icon>
                <span>{{ errorMessage }}</span>
              </div>

              <!-- Submit Button -->
              <button
                mat-raised-button
                color="primary"
                type="submit"
                class="reset-password-button full-width"
                [disabled]="resetPasswordForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="reset-password-spinner"></mat-spinner>
                <span *ngIf="!isLoading">تغيير كلمة المرور</span>
              </button>

              <!-- Back to Login -->
              <div class="back-to-login">
                <button mat-button type="button" (click)="goToLogin()" class="back-link">
                  <lucide-icon name="arrow-left" [size]="16" class="me-2"></lucide-icon>
                  العودة لتسجيل الدخول
                </button>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .reset-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .reset-password-card {
      width: 100%;
      max-width: 440px;
    }

    .reset-password-mat-card {
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      background: #ffffff;
    }

    .reset-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border-radius: 50%;
      margin-bottom: 1.25rem;
    }

    .reset-password-icon {
      color: #1a73e8;
    }

    .reset-password-title {
      font-size: 1.65rem;
      font-weight: 500;
      color: #202124;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.2px;
    }

    .reset-password-subtitle {
      color: #5f6368;
      margin: 0;
      font-size: 0.95rem;
      font-weight: 400;
    }

    .success-state {
      text-align: center;
      padding: 1.5rem 0;
    }

    .success-icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
      border-radius: 50%;
      margin-bottom: 1.5rem;
    }

    .success-icon {
      color: #34a853;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 500;
      color: #202124;
      margin: 0 0 1rem 0;
    }

    .success-message {
      color: #5f6368;
      margin: 0 0 2rem 0;
      line-height: 1.6;
      font-size: 0.95rem;
    }

    .success-actions {
      display: flex;
      justify-content: center;
    }

    .login-button {
      min-width: 160px;
      height: 44px;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
      background-color: #1a73e8 !important;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .login-button:hover {
      background-color: #1557b0 !important;
      box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
    }

    .reset-password-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .full-width {
      width: 100%;
    }

    ::ng-deep .mat-mdc-form-field {
      font-size: 0.95rem;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background-color: #fafafa;
    }

    ::ng-deep .mat-mdc-form-field-focus-overlay {
      background-color: transparent;
    }

    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined .mdc-notched-outline__trailing {
      border-color: #dadce0;
    }

    ::ng-deep .mdc-text-field--outlined:hover .mdc-notched-outline__leading,
    ::ng-deep .mdc-text-field--outlined:hover .mdc-notched-outline__notch,
    ::ng-deep .mdc-text-field--outlined:hover .mdc-notched-outline__trailing {
      border-color: #5f6368;
    }

    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
    ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
      border-color: #1a73e8 !important;
      border-width: 2px !important;
    }

    ::ng-deep .mat-mdc-form-field-icon-prefix,
    ::ng-deep .mat-mdc-form-field-icon-suffix {
      color: #5f6368;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #d93025;
      background-color: #fce8e6;
      padding: 0.875rem 1rem;
      border-radius: 8px;
      font-size: 0.875rem;
      border: 1px solid #f8d7da;
    }

    .error-icon {
      color: #d93025;
      flex-shrink: 0;
    }

    .reset-password-button {
      height: 48px;
      font-size: 0.95rem;
      font-weight: 500;
      margin-top: 0.5rem;
      border-radius: 8px;
      background-color: #1a73e8 !important;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .reset-password-button:hover:not(:disabled) {
      background-color: #1557b0 !important;
      box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
    }

    .reset-password-button:disabled {
      background-color: #dadce0 !important;
      color: #80868b !important;
    }

    .reset-password-spinner {
      display: inline-block;
      margin-left: 0.5rem;
    }

    ::ng-deep .reset-password-spinner circle {
      stroke: #ffffff !important;
    }

    .back-to-login {
      text-align: center;
      margin-top: 1rem;
    }

    .back-link {
      color: #1a73e8;
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      text-transform: none;
      letter-spacing: 0.1px;
      display: inline-flex;
      align-items: center;
    }

    .back-link:hover {
      background-color: rgba(26, 115, 232, 0.04);
    }

    .me-2 {
      margin-left: 0.4rem;
    }

    @media (max-width: 480px) {
      .reset-password-container {
        padding: 1rem;
      }

      .reset-password-mat-card {
        padding: 1.75rem;
      }

      .reset-password-title {
        font-size: 1.5rem;
      }

      .icon-wrapper {
        width: 56px;
        height: 56px;
      }

      .success-icon-wrapper {
        width: 72px;
        height: 72px;
      }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';
  email = '';
  resetToken = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.resetPasswordForm = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Get email and token from query parameters
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.resetToken = params['token'] || '';
      
      if (!this.email || !this.resetToken) {
        this.toastr.error('رابط إعادة التعيين غير صحيح', 'خطأ');
        this.router.navigate(['/auth/forgot-password']);
      }
    });

    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    
    if (newPassword && confirmPassword && newPassword.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.resetPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const resetPasswordRequest: ResetPasswordRequest = {
        email: this.email,
        token: this.resetToken,
        newPassword: this.resetPasswordForm.value.newPassword
      };

      this.authService.resetPassword(resetPasswordRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.toastr.success('تم تغيير كلمة المرور بنجاح', 'تم التغيير');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء تغيير كلمة المرور';
          this.toastr.error(this.errorMessage, 'خطأ');
        }
      });
    }
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  goToLogin() {
    this.router.navigate(['/auth/login']);
  }
}