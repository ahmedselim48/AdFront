import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, CheckCircle, XCircle, Mail, ArrowLeft } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { VerifyEmailRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LucideAngularModule
  ],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent {
  status: 'idle' | 'verifying' | 'success' | 'error' = 'idle';
  message = '';
  email = '';

  constructor(
    private route: ActivatedRoute, 
    private auth: AuthService, 
    private router: Router,
    private toastr: ToastrService
  ) {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    const userId = this.route.snapshot.queryParamMap.get('userId');
    
    this.email = email || '';
    
    // If no token, show a message asking user to check their email
    if (!token) {
      this.status = 'idle';
      this.message = 'يرجى التحقق من بريدك الإلكتروني والنقر على رابط التأكيد المرسل إليك';
      return;
    }
    
    if (!email && !userId) {
      this.status = 'error';
      this.message = 'الرابط غير صالح - البريد الإلكتروني أو معرف المستخدم مطلوب';
      return;
    }
    
    this.status = 'verifying';
    
    // Use appropriate verification method based on available parameters
    if (email) {
      // Use the original verify-email endpoint
      this.auth.confirmEmail({ userId: userId || '', token }).subscribe({
        next: (response) => { 
          this.status = 'success'; 
          this.message = 'تم تأكيد البريد الإلكتروني بنجاح. سيتم توجيهك لصفحة تسجيل الدخول...'; 
          this.toastr.success('تم تأكيد البريد الإلكتروني بنجاح', 'تم التأكيد');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        },
        error: (error) => { 
          this.status = 'error'; 
          this.message = error.error?.message || 'فشل في تأكيد البريد الإلكتروني. الرابط قد يكون منتهي الصلاحية أو غير صالح.';
          this.toastr.error(this.message, 'خطأ في التأكيد');
        }
      });
    } else if (userId) {
      // Use the userId-based verification
      this.auth.confirmEmail({ userId, token }).subscribe({
        next: (response) => { 
          this.status = 'success'; 
          this.message = 'تم تأكيد البريد الإلكتروني بنجاح. سيتم توجيهك لصفحة تسجيل الدخول...'; 
          this.toastr.success('تم تأكيد البريد الإلكتروني بنجاح', 'تم التأكيد');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        },
        error: (error) => { 
          this.status = 'error'; 
          this.message = error.error?.message || 'فشل في تأكيد البريد الإلكتروني. الرابط قد يكون منتهي الصلاحية أو غير صالح.';
          this.toastr.error(this.message, 'خطأ في التأكيد');
        }
      });
    }
  }

  goToLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  resendConfirmation() {
    if (this.email) {
      this.auth.resendConfirmation({ email: this.email }).subscribe({
        next: (response) => {
          this.toastr.success('تم إعادة إرسال رابط التأكيد', 'تم الإرسال');
        },
        error: (error) => {
          this.toastr.error('فشل في إعادة إرسال رابط التأكيد', 'خطأ');
        }
      });
    }
  }
}
