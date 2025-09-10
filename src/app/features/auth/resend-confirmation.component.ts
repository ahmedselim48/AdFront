import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-resend-confirmation',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, TranslatePipe],
  templateUrl: './resend-confirmation.component.html',
  styleUrls: ['./resend-confirmation.component.scss']
})
export class ResendConfirmationComponent {
  form!: FormGroup;
  loading = false;
  error = '';
  success = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({ 
      email: ['', [Validators.required, Validators.email]]
    });
  }

  submit(){
    if(this.form.invalid) return;
    
    this.loading = true;
    this.error = '';
    this.success = '';

    const email = this.form.get('email')?.value ?? '';
    
    this.auth.resendConfirmation({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = 'إذا كان البريد الإلكتروني موجود وغير مؤكد، سيتم إرسال رابط التأكيد';
      },
      error: (error) => {
        this.loading = false;
        this.error = error.error?.message || 'حدث خطأ أثناء إعادة إرسال رابط التأكيد';
      }
    });
  }
}
