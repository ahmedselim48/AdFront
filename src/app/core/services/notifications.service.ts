import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { MockApiService } from './mock-api.service';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  NotificationDto, 
  NotificationRequest, 
  MarkAsReadRequest, 
  NotificationStats,
  NotificationType
} from '../../models/notifications.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {
  private api = inject(ApiClientService);
  private mockApi = inject(MockApiService);
  private baseUrl = environment.apiBaseUrl;
  
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  getNotifications(request: NotificationRequest = {}): Observable<GeneralResponse<NotificationDto[]>> {
    if (environment.production) {
      const params = new URLSearchParams();
      if (request.page) params.set('page', String(request.page));
      if (request.pageSize) params.set('pageSize', String(request.pageSize));
      if (request.type) params.set('type', request.type);
      if (request.isRead !== undefined) params.set('isRead', String(request.isRead));

      return this.api.get$<GeneralResponse<NotificationDto[]>>(`${this.baseUrl}/notifications?${params.toString()}`);
    } else {
      // Mock data for development
      return this.mockApi.getNotifications();
    }
  }

  markAsRead(notificationId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/${notificationId}/read`, {});
  }

  markAllAsRead(): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/mark-all-read`, {});
  }

  getUnreadCount(): Observable<GeneralResponse<number>> {
    return this.api.get$<GeneralResponse<number>>(`${this.baseUrl}/notifications/unread-count`);
  }

  // Update unread count locally
  updateUnreadCount(count: number): void {
    this.unreadCountSubject.next(count);
  }

  // Test notification endpoints (for development)
  testAdPublished(adId: string, adTitle = 'Sample Ad'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/ad/published`, adId, { adTitle });
  }

  testAdExpired(adId: string, adTitle = 'Sample Ad'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/ad/expired`, adId, { adTitle });
  }

  testABTesting(adId: string, variant = 'B'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/ab-testing`, adId, { variant });
  }

  testNewMessage(conversationId: string, fromUserId: string, preview: string): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/chat/new-message`, preview, { 
      conversationId, 
      fromUserId 
    });
  }

  testContact(adId: string, channel = 'WhatsApp', contact = '+9665xxxxxxx'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/contact`, adId, { channel, contact });
  }

  testCheaperCompetitor(adId: string, price = 1000, link = ''): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/competition/cheaper`, adId, { price, link });
  }

  testCompetitionReport(adId: string, period = 'weekly'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/competition/report`, adId, { period });
  }

  testSuspiciousLogin(location = 'Unknown', ip = '1.2.3.4'): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/security/suspicious-login`, {}, { location, ip });
  }

  testPayment(status = 'Success', reference = 'TEST123', amount = 100): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/payment`, {}, { status, reference, amount });
  }

  testSubscriptionExpiring(plan = 'Pro', days = 3): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/subscription/expiring`, {}, { plan, days });
  }

  testWeeklySummary(): Observable<GeneralResponse<boolean>> {
    return this.api.post$<GeneralResponse<boolean>>(`${this.baseUrl}/notifications/test/weekly/summary`, {});
  }
}
