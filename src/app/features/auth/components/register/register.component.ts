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
            <div class="brand-badge">HarajPlus</div>
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
                    <mat-label>الاسم الأول</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="firstName"
                      placeholder="أدخل الاسم الأول"
                      autocomplete="given-name"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="user" size="20"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('required')">
                      الاسم الأول مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('firstName')?.hasError('minlength')">
                      الاسم الأول يجب أن يكون حرفين على الأقل
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>الاسم الأخير</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="lastName"
                      placeholder="أدخل الاسم الأخير"
                      autocomplete="family-name"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="user" size="20"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('required')">
                      الاسم الأخير مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('lastName')?.hasError('minlength')">
                      الاسم الأخير يجب أن يكون حرفين على الأقل
                    </mat-error>
                  </mat-form-field>
                </div>

                <div class="form-row">
                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>اسم المستخدم</mat-label>
                    <input
                      matInput
                      type="text"
                      formControlName="userName"
                      placeholder="مثال: أحمد123 أو ahmed_123 أو محمد.علي"
                      autocomplete="username"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="user" size="20"></lucide-icon>
                    </mat-icon>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('required')">
                      اسم المستخدم مطلوب
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('minlength')">
                      اسم المستخدم يجب أن يكون حرفين على الأقل
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('maxlength')">
                      اسم المستخدم يجب أن يكون 32 حرف على الأكثر
                    </mat-error>
                    <mat-error *ngIf="registerForm.get('userName')?.hasError('invalidUsername')">
                      اسم المستخدم يجب أن يحتوي على أحرف عربية أو إنجليزية وأرقام و _ و . و - فقط
                    </mat-error>
                  </mat-form-field>

                  <mat-form-field appearance="outline" class="half-width">
                    <mat-label>رقم الهاتف (اختياري)</mat-label>
                    <input
                      matInput
                      type="tel"
                      formControlName="phoneNumber"
                      placeholder="أدخل رقم الهاتف"
                      autocomplete="tel"
                      class="form-input">
                    <mat-icon matPrefix>
                      <lucide-icon name="phone" size="20"></lucide-icon>
                    </mat-icon>
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
      position: relative;
      overflow: hidden;
    }

    .register-container::before {
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

    .brand-badge {
      display: inline-block;
      align-self: center;
      margin: 0 auto 0.5rem auto;
      padding: 0.25rem 0.75rem;
      font-weight: 700;
      font-size: 0.8rem;
      letter-spacing: 0.5px;
      color: #fff;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 999px;
      box-shadow: 0 6px 16px rgba(102, 126, 234, 0.35);
    }

    .register-card {
      width: 100%;
      max-width: 450px;
      position: relative;
      z-index: 1;
    }

    .register-mat-card {
      padding: 1.5rem;
      border-radius: 0.75rem;
      box-shadow: 
        0 12px 24px rgba(0, 0, 0, 0.1),
        0 0 0 1px rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .register-header {
      text-align: center;
      margin-bottom: 1rem;
    }

    .register-icon {
      color: #667eea;
      margin-bottom: 0.75rem;
      filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3));
    }

    .register-title {
      font-size: 1.4rem;
      font-weight: 700;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.25rem 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .register-subtitle {
      color: #666;
      margin: 0;
      font-size: 0.85rem;
      font-weight: 400;
    }

    .register-form {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-section {
      border: 1px solid rgba(102, 126, 234, 0.15);
      border-radius: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.8), rgba(248, 250, 252, 0.9));
      backdrop-filter: blur(5px);
      box-shadow: 
        0 2px 4px rgba(0, 0, 0, 0.05),
        inset 0 1px 0 rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
    }

    .form-section:hover {
      border-color: rgba(102, 126, 234, 0.25);
      box-shadow: 
        0 4px 8px rgba(0, 0, 0, 0.08),
        inset 0 1px 0 rgba(255, 255, 255, 0.9);
    }

    /* Enhanced input focus/hover states */
    :host ::ng-deep .mat-mdc-form-field-appearance-outline .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field-appearance-outline .mdc-notched-outline__trailing,
    :host ::ng-deep .mat-mdc-form-field-appearance-outline .mdc-notched-outline__notch {
      transition: border-color 0.25s ease, box-shadow 0.25s ease;
    }

    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing,
    :host ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch {
      border-color: #667eea !important;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12);
    }

    :host ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__leading,
    :host ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__trailing,
    :host ::ng-deep .mat-mdc-form-field:hover .mdc-notched-outline__notch {
      border-color: rgba(102, 126, 234, 0.6);
    }

    .section-title {
      font-size: 0.9rem;
      font-weight: 600;
      background: linear-gradient(135deg, #667eea, #764ba2);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin: 0 0 0.75rem 0;
      padding-bottom: 0.25rem;
      border-bottom: 2px solid transparent;
      border-image: linear-gradient(135deg, #667eea, #764ba2) 1;
      position: relative;
    }

    .section-title::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 30px;
      height: 2px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border-radius: 1px;
    }

    .form-row {
      display: flex;
      gap: 0.5rem;
    }

    .full-width {
      width: 100%;
    }

    .half-width {
      flex: 1;
    }

    .terms-checkbox {
      font-size: 0.85rem;
      margin: 0.75rem 0;
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
      font-size: 0.75rem;
      margin-top: 0.25rem;
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

    .register-button {
      height: 44px;
      font-size: 0.95rem;
      font-weight: 600;
      margin-top: 0.75rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      border: none;
      border-radius: 8px;
      box-shadow: 
        0 3px 10px rgba(102, 126, 234, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      text-transform: none;
      letter-spacing: 0.2px;
    }

    .register-button:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 
        0 8px 25px rgba(102, 126, 234, 0.5),
        0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .register-button:active:not(:disabled) {
      transform: translateY(0);
    }

    .register-button:disabled {
      opacity: 0.6;
      transform: none;
      box-shadow: 
        0 2px 8px rgba(102, 126, 234, 0.2),
        0 1px 2px rgba(0, 0, 0, 0.1);
    }

    .register-spinner {
      margin-left: 0.5rem;
    }

    .login-link {
      text-align: center;
      margin-top: 1rem;
      padding: 0.75rem;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05));
      border-radius: 6px;
      border: 1px solid rgba(102, 126, 234, 0.1);
    }

    .login-link p {
      margin: 0;
      color: #555;
      font-size: 0.9rem;
      font-weight: 400;
    }

    .login-link a {
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

    .login-link a:hover {
      text-decoration: none;
      filter: brightness(1.2);
    }

    .login-link a::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 0;
      height: 2px;
      background: linear-gradient(135deg, #667eea, #764ba2);
      transition: width 0.3s ease;
    }

    .login-link a:hover::after {
      width: 100%;
    }

    @media (max-width: 768px) {
      .register-container {
        padding: 1rem;
      }

      .register-mat-card {
        padding: 1.25rem;
      }

      .form-row {
        flex-direction: column;
        gap: 0;
      }

      .half-width {
        width: 100%;
      }

      .form-section {
        padding: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .register-container {
        padding: 0.5rem;
      }

      .register-mat-card {
        padding: 1rem;
        border-radius: 0.5rem;
      }

      .register-title {
        font-size: 1.25rem;
      }

      .form-section {
        padding: 0.5rem;
        border-radius: 0.375rem;
      }

      .register-button {
        height: 40px;
        font-size: 0.9rem;
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
