import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Mail, ArrowLeft, CheckCircle } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { ForgotPasswordRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-forgot-password',
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
    <div class="forgot-password-container">
      <div class="forgot-password-card">
        <mat-card class="forgot-password-mat-card">
          <mat-card-header>
            <div class="forgot-password-header">
              <div class="icon-wrapper">
                <lucide-icon name="mail" [size]="28" class="forgot-password-icon"></lucide-icon>
              </div>
              <h2 class="forgot-password-title">نسيت كلمة المرور؟</h2>
              <p class="forgot-password-subtitle">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Success State -->
            <div *ngIf="isSuccess" class="success-state">
              <div class="success-icon-wrapper">
                <lucide-icon name="check-circle" [size]="56" class="success-icon"></lucide-icon>
              </div>
              <h3 class="success-title">تم إرسال الرابط بنجاح!</h3>
              <p class="success-message">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                يرجى التحقق من صندوق الوارد أو مجلد الرسائل المزعجة.
              </p>
              <div class="success-actions">
                <button mat-raised-button color="primary" (click)="resendEmail()" [disabled]="isResending" class="resend-button">
                  <mat-spinner *ngIf="isResending" diameter="16" class="button-spinner"></mat-spinner>
                  <span *ngIf="!isResending">إعادة إرسال الرابط</span>
                </button>
                <button mat-stroked-button (click)="goBackToLogin()" class="back-button">
                  <lucide-icon name="arrow-left" [size]="16" class="me-2"></lucide-icon>
                  العودة لتسجيل الدخول
                </button>
              </div>
            </div>

            <!-- Form State -->
            <form *ngIf="!isSuccess" [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()" class="forgot-password-form">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>البريد الإلكتروني</mat-label>
                <input
                  matInput
                  type="email"
                  formControlName="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  autocomplete="email">
                <mat-icon matPrefix>
                  <lucide-icon name="mail" [size]="20"></lucide-icon>
                </mat-icon>
                <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                  البريد الإلكتروني مطلوب
                </mat-error>
                <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                  يرجى إدخال بريد إلكتروني صحيح
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
                class="forgot-password-button full-width"
                [disabled]="forgotPasswordForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="forgot-password-spinner"></mat-spinner>
                <span *ngIf="!isLoading">إرسال رابط إعادة التعيين</span>
              </button>

              <!-- Back to Login -->
              <div class="back-to-login">
                <button mat-button type="button" (click)="goBackToLogin()" class="back-link">
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
    .forgot-password-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 2rem;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .forgot-password-card {
      width: 100%;
      max-width: 440px;
    }

    .forgot-password-mat-card {
      padding: 2.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      background: #ffffff;
    }

    .forgot-password-header {
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

    .forgot-password-icon {
      color: #1a73e8;
    }

    .forgot-password-title {
      font-size: 1.65rem;
      font-weight: 500;
      color: #202124;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.2px;
    }

    .forgot-password-subtitle {
      color: #5f6368;
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
      font-weight: 400;
      padding: 0 1rem;
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
      flex-direction: column;
      gap: 0.875rem;
      margin-top: 1.5rem;
    }

    .resend-button {
      height: 44px;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
      background-color: #1a73e8 !important;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .resend-button:hover:not(:disabled) {
      background-color: #1557b0 !important;
      box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
    }

    .resend-button:disabled {
      background-color: #dadce0 !important;
      color: #80868b !important;
    }

    .back-button {
      height: 44px;
      font-size: 0.95rem;
      font-weight: 500;
      border-radius: 8px;
      color: #1a73e8;
      border-color: #dadce0;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .back-button:hover {
      background-color: rgba(26, 115, 232, 0.04);
      border-color: #1a73e8;
    }

    .button-spinner {
      display: inline-block;
      margin-left: 0.5rem;
    }

    ::ng-deep .button-spinner circle {
      stroke: #ffffff !important;
    }

    .forgot-password-form {
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

    .forgot-password-button {
      height: 48px;
      font-size: 0.95rem;
      font-weight: 500;
      margin-top: 0.5rem;
      border-radius: 8px;
      background-color: #1a73e8 !important;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .forgot-password-button:hover:not(:disabled) {
      background-color: #1557b0 !important;
      box-shadow: 0 2px 4px rgba(26, 115, 232, 0.3);
    }

    .forgot-password-button:disabled {
      background-color: #dadce0 !important;
      color: #80868b !important;
    }

    .forgot-password-spinner {
      display: inline-block;
      margin-left: 0.5rem;
    }

    ::ng-deep .forgot-password-spinner circle {
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
      .forgot-password-container {
        padding: 1rem;
      }

      .forgot-password-mat-card {
        padding: 1.75rem;
      }

      .forgot-password-title {
        font-size: 1.5rem;
      }

      .forgot-password-subtitle {
        padding: 0 0.5rem;
      }

      .icon-wrapper {
        width: 56px;
        height: 56px;
      }

      .success-icon-wrapper {
        width: 72px;
        height: 72px;
      }

      .success-actions {
        gap: 0.75rem;
      }
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm: FormGroup;
  isLoading = false;
  isResending = false;
  isSuccess = false;
  errorMessage = '';
  userEmail = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const forgotPasswordRequest: ForgotPasswordRequest = {
        email: this.forgotPasswordForm.value.email
      };

      this.userEmail = forgotPasswordRequest.email;

      this.authService.forgotPassword(forgotPasswordRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.toastr.success('تم إرسال رابط إعادة التعيين بنجاح', 'تم الإرسال');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء إرسال الرابط';
          this.toastr.error(this.errorMessage, 'خطأ');
        }
      });
    }
  }

  resendEmail() {
    if (this.userEmail) {
      this.isResending = true;
      
      const forgotPasswordRequest: ForgotPasswordRequest = {
        email: this.userEmail
      };

      this.authService.forgotPassword(forgotPasswordRequest).subscribe({
        next: (response) => {
          this.isResending = false;
          this.toastr.success('تم إعادة إرسال الرابط بنجاح', 'تم الإرسال');
        },
        error: (error) => {
          this.isResending = false;
          this.toastr.error('حدث خطأ أثناء إعادة إرسال الرابط', 'خطأ');
        }
      });
    }
  }

  goBackToLogin() {
    this.router.navigate(['/auth/login']);
  }
}