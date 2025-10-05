import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LucideAngularModule } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { SubscriptionService } from '../../../core/services/subscription.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    LucideAngularModule
  ],
  template: `
    <div class="payment-success-container">
      <mat-card class="success-card">
        <div class="success-content" *ngIf="!isProcessing">
          <div class="success-icon">
            <lucide-icon name="check-circle" size="64" color="#10b981"></lucide-icon>
          </div>
          
          <h1>تم الدفع بنجاح!</h1>
          <p>شكراً لك على الاشتراك. تم تفعيل اشتراكك بنجاح.</p>
          
          <div class="payment-details" *ngIf="paymentDetails">
            <div class="detail-item">
              <span class="label">مبلغ الدفع:</span>
              <span class="value">{{ paymentDetails.amount }} ر.س</span>
            </div>
            <div class="detail-item">
              <span class="label">طريقة الدفع:</span>
              <span class="value">{{ paymentDetails.provider }}</span>
            </div>
            <div class="detail-item">
              <span class="label">رقم المعاملة:</span>
              <span class="value">{{ paymentDetails.sessionId }}</span>
            </div>
          </div>
          
          <div class="actions">
            <button mat-raised-button color="primary" (click)="goToProfile()">
              <lucide-icon name="user" size="16"></lucide-icon>
              <span>الذهاب إلى الملف الشخصي</span>
            </button>
            <button mat-button (click)="goToAds()">
              <lucide-icon name="plus" size="16"></lucide-icon>
              <span>إنشاء إعلان جديد</span>
            </button>
          </div>
        </div>
        
        <div class="processing-content" *ngIf="isProcessing">
          <mat-spinner diameter="40"></mat-spinner>
          <h2>جاري تأكيد الدفع...</h2>
          <p>يرجى الانتظار بينما نؤكد عملية الدفع</p>
        </div>
        
        <div class="error-content" *ngIf="hasError">
          <div class="error-icon">
            <lucide-icon name="x-circle" size="64" color="#ef4444"></lucide-icon>
          </div>
          <h1>حدث خطأ</h1>
          <p>{{ errorMessage }}</p>
          <div class="actions">
            <button mat-raised-button color="primary" (click)="retryPayment()">
              <lucide-icon name="refresh-cw" size="16"></lucide-icon>
              <span>إعادة المحاولة</span>
            </button>
            <button mat-button (click)="goToProfile()">
              <lucide-icon name="user" size="16"></lucide-icon>
              <span>الملف الشخصي</span>
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-success-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    }

    .success-card {
      max-width: 500px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .success-content,
    .processing-content,
    .error-content {
      padding: 3rem 2rem;
      text-align: center;
    }

    .success-icon,
    .error-icon {
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #1f2937;
      margin: 0 0 1rem 0;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin: 1rem 0 0.5rem 0;
    }

    p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .payment-details {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      margin: 2rem 0;
      text-align: right;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #e5e7eb;
    }

    .detail-item:last-child {
      border-bottom: none;
      margin-bottom: 0;
    }

    .label {
      font-weight: 500;
      color: #374151;
    }

    .value {
      font-weight: 600;
      color: #1f2937;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: none;
      font-weight: 500;
    }

    .processing-content {
      color: #6b7280;
    }

    .error-content h1 {
      color: #ef4444;
    }

    @media (max-width: 600px) {
      .payment-success-container {
        padding: 1rem;
      }

      .success-content,
      .processing-content,
      .error-content {
        padding: 2rem 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class PaymentSuccessComponent implements OnInit, OnDestroy {
  isProcessing = true;
  hasError = false;
  errorMessage = '';
  paymentDetails: any = null;

  private destroy$ = new Subject<void>();
  private subscriptionService = inject(SubscriptionService);
  private toastr = inject(ToastrService);

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.processPayment();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private processPayment() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const sessionId = params['sessionId'];
      const status = params['status'];
      const provider = params['provider'];

      if (!sessionId) {
        this.showError('لم يتم العثور على معرف الجلسة');
        return;
      }

      this.paymentDetails = {
        sessionId,
        status,
        provider,
        amount: 200 // Default amount
      };

      if (status === 'approved' || status === 'success') {
        this.confirmPayment(sessionId);
      } else if (status === 'canceled') {
        this.showError('تم إلغاء عملية الدفع');
      } else {
        this.showError('حالة الدفع غير معروفة');
      }
    });
  }

  private confirmPayment(sessionId: string) {
    this.subscriptionService.confirmSubscription({ sessionId }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.isProcessing = false;
        if (response.success) {
          this.toastr.success('تم تأكيد الاشتراك بنجاح', 'تم');
          // Refresh subscription data
          this.subscriptionService.getMySubscription().subscribe();
        } else {
          this.showError(response.message || 'فشل في تأكيد الدفع');
        }
      },
      error: (error: any) => {
        this.isProcessing = false;
        console.error('Error confirming payment:', error);
        this.showError('فشل في تأكيد الدفع. يرجى المحاولة مرة أخرى.');
      }
    });
  }

  private showError(message: string) {
    this.isProcessing = false;
    this.hasError = true;
    this.errorMessage = message;
  }

  retryPayment() {
    this.router.navigate(['/profile/subscription']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToAds() {
    this.router.navigate(['/ads/create']);
  }
}


