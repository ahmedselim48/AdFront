import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, CreditCard, Calendar, Check, Star, Crown, Zap, RefreshCw, ExternalLink } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { SubscriptionService } from '../../../../core/services/subscription.service';
import { SubscriptionDto, CheckoutSessionDto, CreateSubscriptionRequestDto } from '../../../../models/payments.models';

@Component({
  selector: 'app-profile-subscription',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './profile-subscription.component.html',
  styleUrls: ['./profile-subscription.component.scss']
})
export class ProfileSubscriptionComponent implements OnInit, OnDestroy {
  subscription: SubscriptionDto | null = null;
  planInfo: any = null;
  isLoading = false;
  isProcessing = false;

  private destroy$ = new Subject<void>();
  private subscriptionService = inject(SubscriptionService);
  private toastr = inject(ToastrService);

  ngOnInit() {
    this.loadSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSubscription() {
    this.isLoading = true;
    
    this.subscriptionService.getMySubscription().pipe(takeUntil(this.destroy$)).subscribe({
      next: (subscription: any) => {
        if (subscription) {
          this.subscription = subscription;
          this.loadPlanInfo();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading subscription:', error);
        this.toastr.error('فشل في تحميل بيانات الاشتراك', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  loadPlanInfo() {
    this.subscriptionService.getSubscriptionPlanInfo().pipe(takeUntil(this.destroy$)).subscribe({
      next: (planInfo: any) => {
        if (planInfo) {
          this.planInfo = planInfo;
        }
      },
      error: (error: any) => {
        console.error('Error loading plan info:', error);
      }
    });
  }

  onUpgradeSubscription() {
    this.isProcessing = true;
    
    const request: CreateSubscriptionRequestDto = { provider: 'paypal' };
    this.subscriptionService.createSubscription(request).pipe(takeUntil(this.destroy$)).subscribe({
      next: (checkoutSession: any) => {
        // Redirect to payment page
        if (checkoutSession && checkoutSession.url) {
          // Open in same window for better UX
          window.location.href = checkoutSession.url;
          this.toastr.info('سيتم توجيهك إلى صفحة الدفع', 'توجيه');
        } else {
          this.toastr.error('فشل في إنشاء جلسة الدفع', 'خطأ');
        }
        this.isProcessing = false;
      },
      error: (error: any) => {
        console.error('Error creating subscription:', error);
        let errorMessage = 'فشل في إنشاء الاشتراك';
        
        if (error.error && error.error.message) {
          if (error.error.message.includes('still active')) {
            errorMessage = 'لديك اشتراك نشط بالفعل';
          } else {
            errorMessage = error.error.message;
          }
        }
        
        this.toastr.error(errorMessage, 'خطأ');
        this.isProcessing = false;
      }
    });
  }

  onRenewSubscription() {
    this.onUpgradeSubscription();
  }

  onCancelSubscription() {
    if (confirm('هل أنت متأكد من إلغاء الاشتراك؟ سيتم إلغاء الاشتراك في نهاية الفترة المدفوعة.')) {
      this.toastr.info('سيتم إلغاء الاشتراك في نهاية الفترة المدفوعة', 'تم');
    }
  }

  onRefresh() {
    this.loadSubscription();
    this.toastr.success('تم تحديث بيانات الاشتراك', 'تم');
  }

  onCreateTestSubscription() {
    if (!confirm('هل تريد إنشاء اشتراك تجريبي لمدة 30 يوم؟ (للتطوير فقط)')) {
      return;
    }

    this.isProcessing = true;
    this.subscriptionService.createTestSubscription().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.toastr.success('تم إنشاء اشتراك تجريبي بنجاح', 'تم');
          this.loadSubscription(); // Refresh subscription data
        } else {
          this.toastr.error('فشل في إنشاء الاشتراك التجريبي', 'خطأ');
        }
        this.isProcessing = false;
      },
      error: (error: any) => {
        console.error('Error creating test subscription:', error);
        this.toastr.error('فشل في إنشاء الاشتراك التجريبي', 'خطأ');
        this.isProcessing = false;
      }
    });
  }

  getPlanIcon(plan: string): string {
    switch (plan.toLowerCase()) {
      case 'premium': return 'crown';
      case 'pro': return 'star';
      case 'free': return 'zap';
      default: return 'credit-card';
    }
  }

  getPlanColor(plan: string): string {
    switch (plan.toLowerCase()) {
      case 'premium': return 'warn';
      case 'pro': return 'primary';
      case 'free': return 'accent';
      default: return 'basic';
    }
  }

  getPlanLabel(plan: string): string {
    switch (plan.toLowerCase()) {
      case 'premium': return 'بريميوم';
      case 'pro': return 'احترافي';
      case 'free': return 'مجاني';
      default: return 'غير محدد';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getDaysRemaining(): number {
    if (!this.subscription || !this.subscription.isActive) {
      return 0;
    }
    return this.subscription.daysLeft || 0;
  }

  getSubscriptionStatus(): string {
    if (!this.subscription) {
      return 'غير محدد';
    }
    
    if (this.subscription.isActive && this.subscription.daysLeft > 0) {
      return 'نشط';
    } else if (this.subscription.isActive && this.subscription.daysLeft === 0) {
      return 'منتهي اليوم';
    } else {
      return 'منتهي';
    }
  }

  getSubscriptionStatusColor(): string {
    const status = this.getSubscriptionStatus();
    switch (status) {
      case 'نشط': return 'primary';
      case 'منتهي اليوم': return 'warn';
      case 'منتهي': return 'warn';
      default: return 'basic';
    }
  }

  getUsagePercentage(): number {
    if (!this.planInfo) return 0;
    
    // Mock calculation - in real app, this would come from API
    const totalAds = this.planInfo.plan === 'Free' ? 5 : 999999;
    const usedAds = 3; // This would come from actual usage data
    return Math.min((usedAds / totalAds) * 100, 100);
  }

  getUsageColor(percentage: number): string {
    if (percentage >= 90) return 'warn';
    if (percentage >= 70) return 'accent';
    return 'primary';
  }

  getPaymentHistory(): any[] {
    // Mock payment history - in real app, this would come from API
    return [
      {
        description: 'اشتراك شهري - خطة احترافية',
        date: new Date().toISOString(),
        amount: 99,
        status: 'success',
        statusText: 'مكتمل'
      },
      {
        description: 'تجديد اشتراك - خطة احترافية',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 99,
        status: 'success',
        statusText: 'مكتمل'
      },
      {
        description: 'ترقية إلى خطة بريميوم',
        date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        amount: 199,
        status: 'success',
        statusText: 'مكتمل'
      }
    ];
  }
}
