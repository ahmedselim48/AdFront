import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <h2>إعادة تعيين كلمة المرور</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div class="form-group">
        <label for="token">رمز التأكيد</label>
        <input formControlName="token" id="token" type="text" placeholder="أدخل الرمز">
      </div>
      <div class="form-group">
        <label for="password">كلمة المرور الجديدة</label>
        <input formControlName="password" id="password" type="password" placeholder="أدخل كلمة المرور الجديدة">
      </div>
      <button type="submit" [disabled]="form.invalid">{{ 'common.reset' | t }}</button>
    </form>
  `,
  styleUrls: []
})
export class ResetPasswordComponent {
  form!: FormGroup;
  private token!: string;
  private userId!: string;
  private email!: string;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private route: ActivatedRoute, private router: Router) {
    this.form = this.fb.group({ 
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
    
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    this.userId = this.route.snapshot.queryParamMap.get('userId') ?? '';
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    
    // If no email but we have userId, get the email from the backend
    if (!this.email && this.userId) {
      this.loading = true;
      this.auth.getUserEmail(this.userId).subscribe({
        next: (response) => {
          this.loading = false;
          this.email = response.data?.email || '';
          if (!this.email) {
            this.error = 'لم يتم العثور على البريد الإلكتروني للمستخدم';
          }
        },
        error: (error) => {
          this.loading = false;
          this.error = 'فشل في الحصول على البريد الإلكتروني';
          console.error('Error getting user email:', error);
        }
      });
    } else if (!this.token || (!this.email && !this.userId)) {
      this.error = 'الرابط غير صالح';
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('newPassword');
    const confirmPassword = form.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  // Get field error message
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'newPassword':
        if (errors['required']) return 'كلمة المرور الجديدة مطلوبة';
        if (errors['minlength']) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        break;
      
      case 'confirmPassword':
        if (errors['required']) return 'تأكيد كلمة المرور مطلوب';
        if (errors['passwordMismatch']) return 'كلمة المرور وتأكيدها غير متطابقين';
        break;
    }

    return '';
  }

  // Check if field has error
  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  // Check if field is valid and should show success
  hasFieldSuccess(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.value) return false;
    
    // Only show success if field is completely valid and user has finished typing
    if (fieldName === 'newPassword') {
      return field.value.length >= 6 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'confirmPassword') {
      return field.value.length >= 6 && !field.errors && field.value === this.form.get('newPassword')?.value && field.dirty;
    }
    
    return !field.errors && field.value.length > 0 && field.dirty;
  }

  // Get field status class
  getFieldStatus(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.touched) return '';
    
    if (field.errors) return 'error';
    if (field.value && !field.errors) return 'success';
    return '';
  }

  submit(){
    if(this.form.invalid || !this.token || (!this.email && !this.userId)) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';

    // Use appropriate method based on available parameters
    if (this.userId) {
      // Use the new endpoint with userId
      this.auth.resetPasswordByUserId(this.userId, this.token, this.form.value.newPassword!).subscribe({ 
        next: (response) => {
          this.loading = false;
          this.success = 'تم إعادة تعيين كلمة المرور بنجاح';
          setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'فشل في إعادة تعيين كلمة المرور';
        }
      });
    } else if (this.email) {
      // Use the original endpoint with email
      this.auth.resetPassword({ 
        email: this.email,
        token: this.token, 
        newPassword: this.form.value.newPassword! 
      }).subscribe({ 
        next: (response) => {
          this.loading = false;
          this.success = 'تم إعادة تعيين كلمة المرور بنجاح';
          setTimeout(() => this.router.navigateByUrl('/auth/login'), 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.message || 'فشل في إعادة تعيين كلمة المرور';
        }
      });
    }
  }
}
