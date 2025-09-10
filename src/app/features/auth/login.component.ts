import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form!: FormGroup;
  loading = false;
  error = '';
  
  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private route: ActivatedRoute) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]], 
      password: ['', Validators.required],
      rememberMe: [false]
    });
  }

  // Get field error message
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'email':
        if (errors['required']) return 'البريد الإلكتروني مطلوب';
        if (errors['email']) return 'البريد الإلكتروني غير صحيح';
        break;
      
      case 'password':
        if (errors['required']) return 'كلمة المرور مطلوبة';
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
    if (fieldName === 'password') {
      return field.value.length >= 3 && !field.errors && field.dirty;
    }
    
    if (fieldName === 'email') {
      return field.value.includes('@') && field.value.includes('.') && field.value.length > 5 && !field.errors && field.dirty;
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
    if(this.form.invalid) return;
    this.loading = true;
    // Don't clear error immediately - let it show until we get a response
    
    const req: LoginRequest = { 
      email: this.form.get('email')?.value ?? '', 
      password: this.form.get('password')?.value ?? '',
      rememberMe: this.form.get('rememberMe')?.value ?? false
    };
    this.auth.login(req).subscribe({
      next: () => {
        this.loading = false;
        this.error = ''; // Clear error on success
        // Save login state based on rememberMe checkbox
        this.auth.saveLoginState(req.rememberMe);
        
        // Navigate to returnUrl or dashboard
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err) => {
        this.loading = false;
        console.error('Login error:', err);
        console.error('Error details:', err.error);
        console.error('Error status:', err.status);
        console.error('Error message:', err.message);
        
        // Handle different error formats
        if (err.error?.message) {
          this.error = err.error.message;
          console.log('Setting error from err.error.message:', this.error);
        } else if (err.error?.errors && err.error.errors.length > 0) {
          this.error = err.error.errors[0];
          console.log('Setting error from err.error.errors[0]:', this.error);
        } else if (err.message) {
          this.error = err.message;
          console.log('Setting error from err.message:', this.error);
        } else {
          this.error = 'فشل في تسجيل الدخول';
          console.log('Setting default error:', this.error);
        }
        
        // Special handling for email confirmation error
        if (this.error.includes('يجب تأكيد البريد الإلكتروني') || this.error.includes('Email not confirmed')) {
          this.error = 'يجب تأكيد البريد الإلكتروني أولاً. يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد.';
          console.log('Setting special email confirmation error:', this.error);
        }
        
        console.log('Final error value:', this.error);
      }
    });
  }
}
