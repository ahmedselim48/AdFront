import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CreateSubscriptionRequestDto,
  CheckoutSessionDto,
  ConfirmSubscriptionRequestDto,
  SubscriptionDto
} from '../../models/payments.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class PaymentsService {
  private api = inject(ApiClientService);
  private baseUrl = environment.apiBaseUrl;

  createSubscription(request: CreateSubscriptionRequestDto): Observable<CheckoutSessionDto> {
    return this.api.post$<CheckoutSessionDto>(`${this.baseUrl}/payments/subscribe`, request);
  }

  confirmSubscription(request: ConfirmSubscriptionRequestDto): Observable<any> {
    return this.api.post$<any>(`${this.baseUrl}/payments/confirm`, request);
  }

  getMySubscription(): Observable<SubscriptionDto> {
    return this.api.get$<SubscriptionDto>(`${this.baseUrl}/subscriptions/my-subscription`);
  }
}
