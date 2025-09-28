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
import { MatStepperModule } from '@angular/material/stepper';
import { LucideAngularModule, Mail, Lock, User, Eye, EyeOff, UserPlus } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { RegisterRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-register',
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
    MatStepperModule,
    LucideAngularModule
  ],
  template: `
    <div class="register-container">
      <div class="register-card">
        <mat-card class="register-mat-card">
          <mat-card-header>
            <div class="register-header">
              <lucide-icon name="user" size="32" class="register-icon"></lucide-icon>
              <h2 class="register-title">إنشاء حساب جديد</h2>
              <p class="register-subtitle">انضم إلى HarajPlus وابدأ رحلتك</p>
            </div>
          </mat-card-header>

          <mat-card-content>
            <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
              <!-- Personal Information -->
              <div class="form-section">
                <h3 class="section-title">المعلومات الشخصية</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>الاسم الكامل</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="fullName"
                      placeholder="أدخل اسمك الكامل"
                      autocomplete="name"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="user" size="20"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('fullName')?.hasError('required')">
                      الاسم الكامل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('fullName')?.hasError('minlength')">
                      الاسم يجب أن يكون 3 أحرف على الأقل
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>اسم المستخدم</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="userName"
                      placeholder="أدخل اسم المستخدم"
                      autocomplete="username"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="user" size="20"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('required')">
                      اسم المستخدم مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('minlength')">
                      اسم المستخدم يجب أن يكون 3 أحرف على الأقل
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Contact Information -->
              <div class="form-section">
                <h3 class="section-title">معلومات الاتصال</h3>
                
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
                  <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                    البريد الإلكتروني مطلوب
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                    يرجى إدخال بريد إلكتروني صحيح
                  </mat-error>
                </mat-form-field>
              </div>

              <!-- Security Information -->
              <div class="form-section">
                <h3 class="section-title">معلومات الأمان</h3>
                
                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>كلمة المرور</mat-label>
                    <input
                      matInput
                      [type]="showPassword ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="أدخل كلمة المرور"
                      autocomplete="new-password">
                    <mat-icon matPrefix>
                      <lucide-icon name="lock" size="20"></lucide-icon>
                    </mat-icon>
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="togglePasswordVisibility()"
                      [attr.aria-label]="'إظهار كلمة المرور'">
                      <mat-icon>
                        <lucide-icon [name]="showPassword ? 'eye-off' : 'eye'" size="20"></lucide-icon>
                      </mat-icon>
                    </button>
                    <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                      كلمة المرور مطلوبة
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                      كلمة المرور يجب أن تكون 6 أحرف على الأقل
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>تأكيد كلمة المرور</mat-label>
                    <input
                      matInput
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      formControlName="confirmPassword"
                      placeholder="أعد إدخال كلمة المرور"
                      autocomplete="new-password">
                    <mat-icon matPrefix>
                      <lucide-icon name="lock" size="20"></lucide-icon>
                    </mat-icon>
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="toggleConfirmPasswordVisibility()"
                      [attr.aria-label]="'إظهار تأكيد كلمة المرور'">
                      <mat-icon>
                        <lucide-icon [name]="showConfirmPassword ? 'eye-off' : 'eye'" size="20"></lucide-icon>
                      </mat-icon>
                    </button>
                    <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                      تأكيد كلمة المرور مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('mismatch')">
                      كلمة المرور غير متطابقة
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="form-section">
                <mat-checkbox formControlName="acceptTerms" class="terms-checkbox">
                  أوافق على <a href="#" class="terms-link">شروط الاستخدام</a> و <a href="#" class="terms-link">سياسة الخصوصية</a>
                </mat-checkbox>
                <mat-error *ngIf="registerForm.get('acceptTerms')?.hasError('required')" class="terms-error">
                  يجب الموافقة على الشروط والأحكام
                </mat-error>
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
                class="register-button full-width"
                [disabled]="registerForm.invalid || isLoading">
                <mat-spinner *ngIf="isLoading" diameter="20" class="register-spinner"></mat-spinner>
                <span *ngIf="!isLoading">إنشاء الحساب</span>
              </button>

              <!-- Login Link -->
              <div class="login-link">
                <p>لديك حساب بالفعل؟ <a routerLink="/auth/login">تسجيل الدخول</a></p>
              </div>
            </form>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 2rem;
    }

    .register-card {
      width: 100%;
      max-width: 600px;
    }

    .register-mat-card {
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }

    .register-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .register-icon {
      color: #667eea;
      margin-bottom: 1rem;
    }

    .register-title {
      font-size: 1.75rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .register-subtitle {
      color: #666;
      margin: 0;
      font-size: 0.9rem;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      border: 1px solid #e0e0e0;
      border-radius: 0.5rem;
      padding: 1.5rem;
      background-color: #fafafa;
    }

    .section-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 1rem 0;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid #667eea;
    }

    .form-row {
      display: flex;
      gap: 1rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .terms-checkbox {
      font-size: 0.9rem;
      margin: 1rem 0;
    }

    .terms-link {
      color: #667eea;
      text-decoration: none;
    }

    .terms-link:hover {
      text-decoration: underline;
    }

    .terms-error {
      color: #f44336;
      font-size: 0.8rem;
      margin-top: 0.5rem;
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

    .register-button {
      height: 48px;
      font-size: 1rem;
      font-weight: 500;
      margin-top: 1rem;
    }

    .register-spinner {
      margin-left: 0.5rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1.5rem;
    }

    .login-link p {
      margin: 0;
      color: #666;
      font-size: 0.9rem;
    }

    .login-link a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
    }

    .login-link a:hover {
      text-decoration: underline;
    }

    @media (max-width: 768px) {
      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 1rem;
      }

      .register-mat-card {
        padding: 1.5rem;
      }

      .register-title {
        font-size: 1.5rem;
      }

      .form-section {
        padding: 1rem;
      }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  isLoading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      userName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      acceptTerms: [false, [Validators.requiredTrue]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerRequest: RegisterRequest = {
        fullName: this.registerForm.value.fullName,
        userName: this.registerForm.value.userName,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword
      };

      this.authService.register(registerRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.toastr.success('تم إنشاء الحساب بنجاح', 'مرحباً');
          this.router.navigate(['/auth/verify-email'], { 
            queryParams: { email: registerRequest.email } 
          });
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء إنشاء الحساب';
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
}
