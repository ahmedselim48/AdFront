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
      <div class="register-wrapper">
        <div class="register-card">
          <!-- Header -->
          <div class="register-header">
            <div class="logo">HarajPlus</div>
            <h1 class="title">إنشاء حساب جديد</h1>
            <p class="subtitle">انضم إلينا وابدأ رحلتك الآن</p>
          </div>

          <!-- Form -->
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="register-form">
            <!-- Personal Information Section -->
            <div class="form-section">
              <h3 class="section-title">المعلومات الشخصية</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">الاسم الأول</label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      type="text"
                      formControlName="firstName"
                      placeholder="أدخل الاسم الأول"
                      autocomplete="given-name">
                    <mat-icon matPrefix class="input-icon">
                      <lucide-icon name="user" size="18"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                      هذا الحقل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('minlength')">
                      حرفين على الأقل
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-group">
                  <label class="form-label">الاسم الأخير</label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      type="text"
                      formControlName="lastName"
                      placeholder="أدخل الاسم الأخير"
                      autocomplete="family-name">
                    <mat-icon matPrefix class="input-icon">
                      <lucide-icon name="user" size="18"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                      هذا الحقل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('minlength')">
                      حرفين على الأقل
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">اسم المستخدم</label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      type="text"
                      formControlName="userName"
                      placeholder="أدخل اسم المستخدم"
                      autocomplete="username">
                    <mat-icon matPrefix class="input-icon">
                      <lucide-icon name="user" size="18"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('required')">
                      هذا الحقل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('minlength')">
                      حرفين على الأقل
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('maxlength')">
                      32 حرف كحد أقصى
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('invalidUsername')">
                      حروف وأرقام و _ . - فقط
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-group">
                  <label class="form-label">رقم الهاتف <span class="optional">(اختياري)</span></label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      type="tel"
                      formControlName="phoneNumber"
                      placeholder="أدخل رقم الهاتف"
                      autocomplete="tel">
                    <mat-icon matPrefix class="input-icon">
                      <lucide-icon name="phone" size="18"></lucide-icon>
                    </mat-icon>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Contact Information Section -->
            <div class="form-section">
              <h3 class="section-title">معلومات الاتصال</h3>
              
              <div class="form-group full-width">
                <label class="form-label">البريد الإلكتروني</label>
                <mat-form-field appearance="outline" class="form-field">
                  <input
                    matInput
                    type="email"
                    formControlName="email"
                    placeholder="أدخل بريدك الإلكتروني"
                    autocomplete="email">
                  <mat-icon matPrefix class="input-icon">
                    <lucide-icon name="mail" size="18"></lucide-icon>
                  </mat-icon>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                    هذا الحقل مطلوب
                  </mat-error>
                  <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                    بريد إلكتروني غير صحيح
                  </mat-error>
                </mat-form-field>
              </div>
            </div>

            <!-- Security Information Section -->
            <div class="form-section">
              <h3 class="section-title">معلومات الأمان</h3>
              
              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">كلمة المرور</label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      [type]="showPassword ? 'text' : 'password'"
                      formControlName="password"
                      placeholder="أدخل كلمة المرور"
                      autocomplete="new-password">
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
                    <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                      هذا الحقل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                      6 أحرف على الأقل
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-group">
                  <label class="form-label">تأكيد كلمة المرور</label>
                  <mat-form-field appearance="outline" class="form-field">
                    <input
                      matInput
                      [type]="showConfirmPassword ? 'text' : 'password'"
                      formControlName="confirmPassword"
                      placeholder="أعد إدخال كلمة المرور"
                      autocomplete="new-password">
                    <mat-icon matPrefix class="input-icon">
                      <lucide-icon name="lock" size="18"></lucide-icon>
                    </mat-icon>
                    <button
                      mat-icon-button
                      matSuffix
                      type="button"
                      (click)="toggleConfirmPasswordVisibility()"
                      class="visibility-toggle">
                      <mat-icon>
                        <lucide-icon [name]="showConfirmPassword ? 'eye-off' : 'eye'" size="18"></lucide-icon>
                      </mat-icon>
                    </button>
                    <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                      هذا الحقل مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('mismatch')">
                      كلمة المرور غير متطابقة
                    </mat-error>
                  </mat-form-field>
                </div>
              </div>
            </div>

            <!-- Terms and Conditions -->
            <div class="terms-section">
              <mat-checkbox formControlName="acceptTerms" class="checkbox">
                أوافق على 
                <a href="#" class="link">شروط الاستخدام</a> 
                و 
                <a href="#" class="link">سياسة الخصوصية</a>
              </mat-checkbox>
              <div class="terms-error" *ngIf="registerForm.get('acceptTerms')?.touched && registerForm.get('acceptTerms')?.hasError('required')">
                يجب الموافقة على الشروط والأحكام
              </div>
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
              [disabled]="registerForm.invalid || isLoading">
              <mat-spinner *ngIf="isLoading" diameter="18" class="btn-spinner"></mat-spinner>
              <span *ngIf="!isLoading">إنشاء الحساب</span>
            </button>

            <!-- Login Link -->
            <div class="footer-text">
              لديك حساب بالفعل؟ 
              <a routerLink="/auth/login" class="link">تسجيل الدخول</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Container */
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #f8f9fa;
      padding: 2rem 1.5rem;
    }

    .register-wrapper {
      width: 100%;
      max-width: 600px;
    }

    .register-card {
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      padding: 2.5rem;
    }

    /* Header */
    .register-header {
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
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      padding: 0;
      background-color: transparent;
      border-radius: 0;
      border: none;
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-size: 1rem;
      font-weight: 600;
      color: #202124;
      margin: 0 0 1.25rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e8eaed;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.25rem;
      margin-bottom: 0.25rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
      margin-bottom: 0.25rem;
    }

    .form-label {
      display: block;
      font-size: 0.875rem;
      font-weight: 500;
      color: #202124;
      margin-bottom: 0.625rem;
    }

    .optional {
      color: #5f6368;
      font-weight: 400;
      font-size: 0.8125rem;
    }

    .form-field {
      width: 100%;
    }

    /* Material Field Customization */
    :host ::ng-deep .form-field .mat-mdc-text-field-wrapper {
      background-color: #ffffff;
      padding-top: 0;
    }

    :host ::ng-deep .form-field .mdc-text-field {
      padding: 0 14px;
    }

    :host ::ng-deep .form-field .mat-mdc-form-field-infix {
      padding-top: 16px;
      padding-bottom: 16px;
      min-height: 48px;
    }

    :host ::ng-deep .form-field .mdc-notched-outline__leading,
    :host ::ng-deep .form-field .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field .mdc-notched-outline__notch {
      border-color: #dadce0;
      border-width: 1px;
    }

    :host ::ng-deep .form-field:hover:not(.mat-focused) .mdc-notched-outline__leading,
    :host ::ng-deep .form-field:hover:not(.mat-focused) .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field:hover:not(.mat-focused) .mdc-notched-outline__notch {
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
      padding-right: 8px;
      margin-right: 8px;
    }

    :host ::ng-deep .form-field.mat-focused .mat-mdc-form-field-icon-prefix {
      color: #1a73e8;
    }

    :host ::ng-deep .form-field input {
      font-size: 0.9375rem;
      color: #202124;
      height: auto;
    }

    :host ::ng-deep .form-field input::placeholder {
      color: #80868b;
    }

    :host ::ng-deep .form-field .mat-mdc-form-field-error {
      font-size: 0.75rem;
      color: #d93025;
      margin-top: 4px;
    }

    :host ::ng-deep .form-field .mat-mdc-form-field-hint {
      font-size: 0.75rem;
      color: #5f6368;
    }

    :host ::ng-deep .form-field.mat-form-field-invalid .mdc-notched-outline__leading,
    :host ::ng-deep .form-field.mat-form-field-invalid .mdc-notched-outline__trailing,
    :host ::ng-deep .form-field.mat-form-field-invalid .mdc-notched-outline__notch {
      border-color: #d93025 !important;
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

    /* Terms Section */
    .terms-section {
      padding: 1.25rem;
      background-color: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e8eaed;
      margin-top: 0.5rem;
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

    .terms-error {
      color: #d93025;
      font-size: 0.75rem;
      margin-top: 0.5rem;
      padding: 0.5rem;
      background-color: #fce8e6;
      border-radius: 4px;
    }

    /* Alert */
    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border-radius: 6px;
      font-size: 0.875rem;
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
    @media (max-width: 768px) {
      .register-container {
        padding: 1.5rem 1rem;
      }

      .register-card {
        padding: 2rem 1.5rem;
      }

      .form-row {
        grid-template-columns: 1fr;
        gap: 0;
      }

      .form-group {
        margin-bottom: 0.25rem;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 1rem;
      }

      .register-card {
        padding: 1.5rem 1.25rem;
      }

      .title {
        font-size: 1.5rem;
      }

      .subtitle {
        font-size: 0.875rem;
      }

      .terms-section {
        padding: 1rem;
      }

      .section-title {
        font-size: 0.9375rem;
        margin-bottom: 1rem;
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
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      userName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(32), this.usernameValidator]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
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

  usernameValidator(control: any) {
    if (!control.value) {
      return null;
    }
    
    const username = control.value;
    // Username must be 2-32 chars and can include letters (including Arabic), digits, underscore, dot, and hyphen
    const usernameRegex = /^[a-zA-Z\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9_.-]{2,32}$/;
    
    if (!usernameRegex.test(username)) {
      return { invalidUsername: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const registerRequest: RegisterRequest = {
        firstName: this.registerForm.value.firstName,
        lastName: this.registerForm.value.lastName,
        userName: this.registerForm.value.userName,
        email: this.registerForm.value.email,
        phoneNumber: this.registerForm.value.phoneNumber,
        password: this.registerForm.value.password
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
          console.error('Registration error:', error);
          console.error('Error details:', error.error);
          
          // Handle validation errors
          if (error.error?.errors) {
            const validationErrors = error.error.errors;
            const errorMessages = Object.values(validationErrors).flat();
            this.errorMessage = errorMessages.join(', ');
          } else if (error.error?.message) {
            this.errorMessage = error.error.message;
          } else if (error.status === 400) {
            this.errorMessage = 'البيانات المدخلة غير صحيحة. يرجى التحقق من جميع الحقول';
          } else if (error.status === 409) {
            this.errorMessage = 'اسم المستخدم أو البريد الإلكتروني مستخدم بالفعل';
          } else if (error.status === 0) {
            this.errorMessage = 'لا يمكن الاتصال بالخادم. يرجى المحاولة لاحقاً';
          } else {
            this.errorMessage = 'حدث خطأ أثناء إنشاء الحساب';
          }
          
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