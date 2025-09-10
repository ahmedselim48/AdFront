import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ForgotPasswordRequest } from '../../models/auth.models';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';
  
  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ email: ['', [Validators.required, Validators.email]] });
  }
  
  submit() {
    if (this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';
    
    const req: ForgotPasswordRequest = { email: this.form.get('email')?.value ?? '' };
    
    this.auth.forgotPassword(req).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. يرجى التحقق من بريدك.';
        console.log('Forgot password success:', response);
      },
      error: (error) => {
        this.loading = false;
        console.error('Forgot password error:', error);
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
          this.error = 'حدث خطأ أثناء إرسال رابط الاستعادة';
        }
      }
    });
  }
}
