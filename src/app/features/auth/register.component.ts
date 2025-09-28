import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { RegisterRequest } from '../../models/auth.models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';
  showConfirmationMessage = false;
  userEmail = '';

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {
    this.form = this.fb.group({ 
      userName: ['', [Validators.required, this.userNameValidator]], 
      firstName: ['', [Validators.required, this.nameValidator]], 
      lastName: ['', [Validators.required, this.nameValidator]], 
      email: ['', [Validators.required, Validators.email]], 
      phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]],
      password: ['', [Validators.required, Validators.minLength(6), this.passwordValidator]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Custom validators
  userNameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    if (value.length < 3) {
      return { userNameMinLength: true };
    }
    
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return { userNameInvalid: true };
    }
    
    return null;
  }

  nameValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    if (value.length < 2) {
      return { nameMinLength: true };
    }
    
    if (!/^[a-zA-Z\u0600-\u06FF\s]+$/.test(value)) {
      return { nameInvalid: true };
    }
    
    return null;
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumbers = /\d/.test(value);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(value);
    
    if (!hasUpperCase) {
      return { passwordNoUpperCase: true };
    }
    
    if (!hasLowerCase) {
      return { passwordNoLowerCase: true };
    }
    
    if (!hasNumbers) {
      return { passwordNoNumbers: true };
    }
    
    if (!hasSpecialChar) {
      return { passwordNoSpecialChar: true };
    }
    
    return null;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
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
      case 'userName':
        if (errors['required']) return 'اسم المستخدم مطلوب';
        if (errors['userNameMinLength']) return 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل';
        if (errors['userNameInvalid']) return 'اسم المستخدم يجب أن يحتوي على أحرف وأرقام و _ فقط';
        break;
      
      case 'firstName':
        if (errors['required']) return 'الاسم الأول مطلوب';
        if (errors['nameMinLength']) return 'الاسم الأول يجب أن يكون حرفين على الأقل';
        if (errors['nameInvalid']) return 'الاسم الأول يجب أن يحتوي على أحرف فقط';
        break;
      
      case 'lastName':
        if (errors['required']) return 'الاسم الأخير مطلوب';
        if (errors['nameMinLength']) return 'الاسم الأخير يجب أن يكون حرفين على الأقل';
        if (errors['nameInvalid']) return 'الاسم الأخير يجب أن يحتوي على أحرف فقط';
        break;
      
      case 'phoneNumber':
        if (errors['pattern']) return 'رقم الهاتف غير صحيح';
        break;
      
      case 'email':
        if (errors['required']) return 'البريد الإلكتروني مطلوب';
        if (errors['email']) return 'البريد الإلكتروني غير صحيح';
        break;
      
      case 'password':
        if (errors['required']) return 'كلمة المرور مطلوبة';
        if (errors['minlength']) return 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        if (errors['passwordNoUpperCase']) return 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل';
        if (errors['passwordNoLowerCase']) return 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل';
        if (errors['passwordNoNumbers']) return 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل';
        if (errors['passwordNoSpecialChar']) return 'كلمة المرور يجب أن تحتوي على رمز خاص واحد على الأقل';
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
    // This prevents showing success while user is still typing
    if (fieldName === 'password') {
      return field.value.length >= 6 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'userName') {
      return field.value.length >= 3 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'firstName' || fieldName === 'lastName') {
      return field.value.length >= 2 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'email') {
      return field.value.includes('@') && field.value.includes('.') && field.value.length > 5 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'confirmPassword') {
      return field.value.length >= 6 && !field.errors && field.value === this.form.get('password')?.value && field.dirty;
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

  // Password strength helper methods
  hasUpperCase(value: string): boolean {
    return /[A-Z]/.test(value);
  }

  hasLowerCase(value: string): boolean {
    return /[a-z]/.test(value);
  }

  hasNumbers(value: string): boolean {
    return /\d/.test(value);
  }

  hasSpecialChar(value: string): boolean {
    return /[!@#$%^&*(),.?":{}|<>]/.test(value);
  }

  submit(){
    if(this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';

    const req: RegisterRequest = { 
      userName: this.form.get('userName')?.value ?? '', 
      firstName: this.form.get('firstName')?.value ?? '', 
      lastName: this.form.get('lastName')?.value ?? '', 
      email: this.form.get('email')?.value ?? '', 
      phoneNumber: this.form.get('phoneNumber')?.value ?? '',
      password: this.form.get('password')?.value ?? ''
    };
    
    console.log('Register request:', req);
    
    this.auth.register(req).subscribe({
      next: (response) => {
        this.loading = false;
        this.userEmail = req.email || '';
        this.showConfirmationMessage = true;
        console.log('Register success:', response);
      },
      error: (error) => {
        this.loading = false;
        console.error('Register error:', error);
        console.error('Error details:', error.error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        
        // Handle different error formats
        if (error.error?.message) {
          this.error = error.error.message;
        } else if (error.error?.errors && error.error.errors.length > 0) {
          this.error = error.error.errors[0];
        } else if (error.message) {
          this.error = error.message;
        } else {
          this.error = 'حدث خطأ أثناء التسجيل';
        }
      }
    });
  }

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  resendConfirmation() {
    this.loading = true;
    this.error = '';
    
    this.auth.resendConfirmation({ email: this.userEmail }).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'تم إعادة إرسال رسالة التأكيد بنجاح';
      },
      error: (error) => {
        this.loading = false;
        this.error = 'فشل في إعادة إرسال رسالة التأكيد';
        console.error('Resend confirmation error:', error);
      }
    });
  }
}
