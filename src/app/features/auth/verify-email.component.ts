import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.scss']
})
export class VerifyEmailComponent {
  status: 'idle' | 'verifying' | 'success' | 'error' = 'idle';
  message = '';
  constructor(private route: ActivatedRoute, private auth: AuthService, private router: Router) {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    const userId = this.route.snapshot.queryParamMap.get('userId');
    
    if (!token) {
      this.status = 'error';
      this.message = 'الرابط غير صالح - الرمز مفقود';
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
      this.auth.verifyEmail({ token, email }).subscribe({
        next: (response) => { 
          this.status = 'success'; 
          this.message = 'تم تأكيد البريد الإلكتروني بنجاح. سيتم توجيهك لصفحة تسجيل الدخول...'; 
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        },
        error: (error) => { 
          this.status = 'error'; 
          this.message = error.error?.message || 'فشل تأكيد البريد الإلكتروني'; 
        }
      });
    } else if (userId) {
      // Use the new verify-email-by-userid endpoint
      this.auth.verifyEmailByUserId(token, userId).subscribe({
        next: (response) => { 
          this.status = 'success'; 
          this.message = 'تم تأكيد البريد الإلكتروني بنجاح. سيتم توجيهك لصفحة تسجيل الدخول...'; 
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            this.router.navigateByUrl('/auth/login');
          }, 3000);
        },
        error: (error) => { 
          this.status = 'error'; 
          this.message = error.error?.message || 'فشل تأكيد البريد الإلكتروني'; 
        }
      });
    }
  }
  goLogin(){ this.router.navigateByUrl('/auth/login'); }
}


