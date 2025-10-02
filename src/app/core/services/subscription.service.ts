import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';
import { 
  SubscriptionDto, 
  CheckoutSessionDto, 
  CreateSubscriptionRequestDto, 
  ConfirmSubscriptionRequestDto, 
  PaymentRequestDto, 
  PaymentResponseDto 
} from '../../models/profile.models';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private readonly apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) {}

  // Get user's subscription
  getMySubscription(): Observable<SubscriptionDto> {
    return this.http.get<SubscriptionDto>(`${this.apiUrl}/subscriptions/my-subscription`);
  }

  // Create subscription checkout session
  createSubscription(request: CreateSubscriptionRequestDto): Observable<CheckoutSessionDto> {
    return this.http.post<CheckoutSessionDto>(`${this.apiUrl}/payments/subscribe`, request);
  }

  // Confirm subscription
  confirmSubscription(request: ConfirmSubscriptionRequestDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(`${this.apiUrl}/payments/confirm`, request);
  }

  // Create payment
  createPayment(request: PaymentRequestDto): Observable<CheckoutSessionDto> {
    return this.http.post<CheckoutSessionDto>(`${this.apiUrl}/payments/create`, request);
  }

  // Confirm payment
  confirmPayment(request: ConfirmSubscriptionRequestDto): Observable<PaymentResponseDto> {
    return this.http.post<PaymentResponseDto>(`${this.apiUrl}/payments/confirm`, request);
  }

  // Get subscription status (from account controller)
  getSubscriptionStatus(): Observable<{ success: boolean; data: { hasActive: boolean; daysRemaining?: number; endDate?: string } }> {
    return this.http.get<{ success: boolean; data: { hasActive: boolean; daysRemaining?: number; endDate?: string } }>(`${this.apiUrl}/account/subscription-status`);
  }

  // Check if user has active subscription
  hasActiveSubscription(): Observable<boolean> {
    return new Observable(observer => {
      this.getMySubscription().subscribe({
        next: (subscription) => {
          observer.next(subscription.isActive && subscription.daysLeft > 0);
          observer.complete();
        },
        error: () => {
          observer.next(false);
          observer.complete();
        }
      });
    });
  }

  // Get subscription plan info
  getSubscriptionPlanInfo(): Observable<{
    plan: string;
    features: string[];
    price: number;
    currency: string;
    duration: string;
  }> {
    return new Observable(observer => {
      this.getMySubscription().subscribe({
        next: (subscription) => {
          const planInfo = {
            plan: subscription.isActive ? 'Premium' : 'Free',
            features: subscription.isActive ? [
              'إعلانات غير محدودة',
              'تحليل المنافسة',
              'تقارير مفصلة',
              'دعم أولوية',
              'إشعارات متقدمة'
            ] : [
              'إعلانات محدودة (5 شهرياً)',
              'مشاهدة أساسية',
              'دعم المجتمع'
            ],
            price: subscription.amount,
            currency: 'SAR',
            duration: 'شهري'
          };
          observer.next(planInfo);
          observer.complete();
        },
        error: () => {
          observer.next({
            plan: 'Free',
            features: [
              'إعلانات محدودة (5 شهرياً)',
              'مشاهدة أساسية',
              'دعم المجتمع'
            ],
            price: 0,
            currency: 'SAR',
            duration: 'شهري'
          });
          observer.complete();
        }
      });
    });
  }

  // Create test subscription (Development only)
  createTestSubscription(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/subscriptions/create-test-subscription`, {});
  }
}
