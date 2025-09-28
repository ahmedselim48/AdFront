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
              <lucide-icon name="mail" size="32" class="forgot-password-icon"></lucide-icon>
              <h2 class="forgot-password-title">نسيت كلمة المرور؟</h2>
              <p class="forgot-password-subtitle">أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة تعيين كلمة المرور</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <!-- Success State -->
            <div *ngIf="isSuccess" class="success-state">
              <lucide-icon name="check-circle" size="48" class="success-icon"></lucide-icon>
              <h3 class="success-title">تم إرسال الرابط بنجاح!</h3>
              <p class="success-message">
                تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني.
                يرجى التحقق من صندوق الوارد أو مجلد الرسائل المزعجة.
              </p>
              <div class="success-actions">
                <button mat-stroked-button (click)="goBackToLogin()" class="back-button">
                  <lucide-icon name="arrow-left" size="16" class="me-2"></lucide-icon>
                  العودة لتسجيل الدخول
                </button>
                <button mat-raised-button color="primary" (click)="resendEmail()" [disabled]="isResending">
                  <mat-spinner *ngIf="isResending" diameter="16" class="me-2"></mat-spinner>
                  إعادة إرسال الرابط
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
                  <lucide-icon name="mail" size="20"></lucide-icon>
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
                  <lucide-icon name="alert-circle" size="20"></lucide-icon>
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
                  <lucide-icon name="arrow-left" size="16" class="me-2"></lucide-icon>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .forgot-password-card {
      width: 100%;
      max-width: 450px;
    }

    .forgot-password-mat-card {
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .forgot-password-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .forgot-password-icon {
      color: #667eea;
      margin-bottom: 1rem;
    }

    .forgot-password-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .forgot-password-subtitle {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .success-state {
      text-align: center;
      padding: 1rem 0;
    }

    .success-icon {
      color: #4caf50;
      margin-bottom: 1rem;
    }

    .success-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1rem 0;
    }

    .success-message {
      color: #666;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .success-actions {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .back-button {
      width: 100%;
    }

    .forgot-password-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .full-width {
      width: 100%;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #f44336;
      background-color: #ffebee;
      padding: 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.9rem;
    }

    .error-icon {
      color: #f44336;
    }

    .forgot-password-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      margin-top: 0.5rem;
    }

    .forgot-password-spinner {
      margin-left: 0.5rem;
    }

    .back-to-login {
      text-align: center;
      margin-top: 1.5rem;
    }

    .back-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .back-link:hover {
      text-decoration: underline;
    }

    .me-2 {
      margin-left: 0.5rem;
    }

    @media (max-width: 480px) {
      .forgot-password-container {
        padding: 1rem;
      }

      .forgot-password-mat-card {
        padding: 1.5rem;
      }

      .forgot-password-title {
        font-size: 1.5rem;
      }

      .success-actions {
        flex-direction: column;
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
