import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';
import { NotificationDto, NotificationSettingsDto, NotificationFilters } from '../../models/profile.models';
import { SignalRService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;
  private destroy$ = new Subject<void>();
  
  // Observable for real-time notifications
  private notificationsSubject = new BehaviorSubject<NotificationDto[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // Observable for unread count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(
    private http: HttpClient,
    private signalRService: SignalRService
  ) {
    this.loadNotifications();
    this.setupSignalRListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSignalRListeners() {
    // Listen for new notifications from SignalR
    this.signalRService.newNotification$.pipe(takeUntil(this.destroy$)).subscribe(notification => {
      if (notification) {
        this.addNotification(notification);
      }
    });

    // Listen for notification updates from SignalR
    this.signalRService.notificationUpdated$.pipe(takeUntil(this.destroy$)).subscribe(notification => {
      if (notification) {
        this.updateNotification(notification);
      }
    });
  }

  // Get notifications with pagination
  getNotifications(page: number = 1, pageSize: number = 20, filters?: NotificationFilters): Observable<GeneralResponse<NotificationDto[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters?.type) {
      params = params.set('type', filters.type);
    }
    if (filters?.isRead !== undefined) {
      params = params.set('isRead', filters.isRead.toString());
    }
    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<GeneralResponse<NotificationDto[]>>(this.apiUrl, { params });
  }

  // Load notifications and update observables
  private loadNotifications(): void {
    this.getNotifications(1, 50).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.notificationsSubject.next(response.data);
          this.updateUnreadCount(response.data);
        }
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  // Update unread count
  private updateUnreadCount(notifications: NotificationDto[]): void {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    this.unreadCountSubject.next(unreadCount);
  }

  // Mark notification as read
  markAsRead(notificationId: string): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(`${this.apiUrl}/read-all`, {});
  }

  // Delete notification
  deleteNotification(notificationId: string): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.apiUrl}/${notificationId}`);
  }

  // Delete all notifications
  deleteAllNotifications(): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.apiUrl}/all`);
  }

  // Get notification settings
  getNotificationSettings(): Observable<GeneralResponse<NotificationSettingsDto>> {
    return this.http.get<GeneralResponse<NotificationSettingsDto>>(`${this.apiUrl}/settings`);
  }

  // Update notification settings
  updateNotificationSettings(settings: NotificationSettingsDto): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(`${this.apiUrl}/settings`, settings);
  }

  // Refresh notifications
  refreshNotifications(): void {
    this.loadNotifications();
  }

  // Add notification to local list (for real-time updates)
  addNotification(notification: NotificationDto): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
    this.updateUnreadCount([notification, ...currentNotifications]);
  }

  // Update notification in local list
  updateNotification(notification: NotificationDto): void {
    const currentNotifications = this.notificationsSubject.value;
    const index = currentNotifications.findIndex(n => n.id === notification.id);
    if (index !== -1) {
      currentNotifications[index] = notification;
      this.notificationsSubject.next([...currentNotifications]);
      this.updateUnreadCount(currentNotifications);
    }
  }

  // Remove notification from local list
  removeNotification(notificationId: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(filteredNotifications);
    this.updateUnreadCount(filteredNotifications);
  }
}