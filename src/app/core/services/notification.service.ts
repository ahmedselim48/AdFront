import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as signalR from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { 
  NotificationDto, 
  NotificationListResponseDto, 
  NotificationBadgeDto,
  NotificationStatsDto,
  NotificationFilterDto,
  NotificationSettingsDto,
  BulkNotificationActionDto,
  NotificationActionDto,
  RealTimeNotificationDto
} from '../../models/notification.model';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private hubConnection?: signalR.HubConnection;
  private readonly apiUrl = `${environment.apiUrl}/api/notifications`;
  private readonly hubUrl = `${environment.apiUrl}/notificationHub`;

  // State management
  private notificationsSubject = new BehaviorSubject<NotificationDto[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private connectionStateSubject = new BehaviorSubject<boolean>(false);
  private connectionErrorSubject = new Subject<string>();

  // Public observables
  public readonly notifications$ = this.notificationsSubject.asObservable();
  public readonly unreadCount$ = this.unreadCountSubject.asObservable();
  public readonly connectionState$ = this.connectionStateSubject.asObservable();
  public readonly connectionError$ = this.connectionErrorSubject.asObservable();

  constructor(
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {}

  /**
   * Start SignalR connection to NotificationHub
   */
  async startConnection(token: string): Promise<void> {
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) {
      console.log('NotificationHub already connected');
      return;
    }

    try {
      this.hubConnection = new signalR.HubConnectionBuilder()
        .withUrl(this.hubUrl, {
          accessTokenFactory: () => token,
          transport: signalR.HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: retryContext => {
            if (retryContext.previousRetryCount < 3) {
              return Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 30000);
            }
            return 30000; // Max 30 seconds
          }
        })
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Connection event handlers
      this.hubConnection.onclose((error) => {
        console.error('NotificationHub connection closed:', error);
        this.connectionStateSubject.next(false);
        if (error) {
          this.connectionErrorSubject.next('Connection lost. Attempting to reconnect...');
        }
      });

      this.hubConnection.onreconnecting((error) => {
        console.log('NotificationHub reconnecting:', error);
        this.connectionStateSubject.next(false);
        this.connectionErrorSubject.next('Reconnecting to notifications...');
      });

      this.hubConnection.onreconnected((connectionId) => {
        console.log('NotificationHub reconnected:', connectionId);
        this.connectionStateSubject.next(true);
        this.connectionErrorSubject.next('');
        // Refresh notifications after reconnection
        this.getLatest(10).subscribe();
      });

      // Notification event handlers
      this.setupNotificationHandlers();

      // Start connection
      await this.hubConnection.start();
      console.log('NotificationHub connected successfully');
      this.connectionStateSubject.next(true);
      this.connectionErrorSubject.next('');

      // Get initial notifications
      this.getLatest(10).subscribe();

    } catch (error) {
      console.error('Error starting NotificationHub connection:', error);
      this.connectionStateSubject.next(false);
      this.connectionErrorSubject.next('Failed to connect to notifications');
      throw error;
    }
  }

  /**
   * Stop SignalR connection
   */
  async stopConnection(): Promise<void> {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.hubConnection = undefined;
      this.connectionStateSubject.next(false);
      console.log('NotificationHub connection stopped');
    }
  }

  /**
   * Setup SignalR event handlers
   */
  private setupNotificationHandlers(): void {
    if (!this.hubConnection) return;

    // General notification
    this.hubConnection.on('ReceiveNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received notification:', notification);
      this.handleNewNotification(notification);
    });

    // Ad-specific notification
    this.hubConnection.on('ReceiveAdNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received ad notification:', notification);
      this.handleNewNotification(notification);
    });

    // Urgent notification
    this.hubConnection.on('ReceiveUrgentNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received urgent notification:', notification);
      this.handleNewNotification(notification);
      this.showUrgentNotification(notification);
    });

    // High priority notification
    this.hubConnection.on('ReceiveHighPriorityNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received high priority notification:', notification);
      this.handleNewNotification(notification);
    });

    // Chat notification
    this.hubConnection.on('ReceiveChatNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received chat notification:', notification);
      this.handleNewNotification(notification);
    });

    // System broadcast
    this.hubConnection.on('ReceiveSystemBroadcast', (notification: RealTimeNotificationDto) => {
      console.log('Received system broadcast:', notification);
      this.handleNewNotification(notification);
      this.showSystemNotification(notification);
    });

    // Group notification
    this.hubConnection.on('ReceiveGroupNotification', (notification: RealTimeNotificationDto) => {
      console.log('Received group notification:', notification);
      this.handleNewNotification(notification);
    });

    // Unread count update
    this.hubConnection.on('UnreadCountUpdate', (data: { unreadCount: number }) => {
      console.log('Unread count updated:', data.unreadCount);
      this.unreadCountSubject.next(data.unreadCount);
    });

    // Notification status update
    this.hubConnection.on('NotificationStatusUpdate', (data: { notificationId: string, status: string }) => {
      console.log('Notification status updated:', data);
      this.updateNotificationStatus(data.notificationId, data.status);
    });

    // Connection established
    this.hubConnection.on('ConnectionEstablished', (data: unknown) => {
      console.log('Connection established:', data);
      this.connectionStateSubject.next(true);
    });

    // Connection status
    this.hubConnection.on('ConnectionStatus', (data: unknown) => {
      console.log('Connection status:', data);
      if (data && typeof data === 'object' && 'isConnected' in data) {
        this.connectionStateSubject.next((data as { isConnected: boolean }).isConnected);
      }
    });
  }

  /**
   * Handle new notification from SignalR
   */
  private handleNewNotification(notification: RealTimeNotificationDto): void {
    const notificationDto: NotificationDto = {
      id: notification.id,
      userId: '', // Will be set by backend
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority,
      category: notification.category,
      isRead: false,
      createdAt: new Date(notification.createdAt),
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      actionType: notification.actionType,
      clickCount: 0,
      isArchived: false,
      status: 'Unread',
      data: notification.data
    };

    // Prepend to notifications list
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notificationDto, ...currentNotifications]);

    // Increment unread count
    const currentUnreadCount = this.unreadCountSubject.value;
    this.unreadCountSubject.next(currentUnreadCount + 1);

    // Show toast notification (optional)
    this.showToastNotification(notificationDto);
  }

  /**
   * Show toast notification
   */
  private showToastNotification(notification: NotificationDto): void {
    const duration = notification.priority === 'Urgent' ? 10000 : 5000;
    const panelClass = this.getPriorityPanelClass(notification.priority);

    this.snackBar.open(notification.title, notification.actionText || 'عرض', {
      duration,
      panelClass,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      direction: 'rtl'
    });
  }

  /**
   * Show urgent notification
   */
  private showUrgentNotification(notification: RealTimeNotificationDto): void {
    this.snackBar.open(
      `🚨 ${notification.title}`, 
      notification.actionText || 'عرض', 
      {
        duration: 0, // Don't auto-dismiss urgent notifications
        panelClass: 'urgent-notification',
        horizontalPosition: 'center',
        verticalPosition: 'top',
        direction: 'rtl'
      }
    );
  }

  /**
   * Show system notification
   */
  private showSystemNotification(notification: RealTimeNotificationDto): void {
    this.snackBar.open(
      `📢 ${notification.title}`, 
      'موافق', 
      {
        duration: 8000,
        panelClass: 'system-notification',
        horizontalPosition: 'center',
        verticalPosition: 'top',
        direction: 'rtl'
      }
    );
  }

  /**
   * Get priority panel class for styling
   */
  private getPriorityPanelClass(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'urgent-notification';
      case 'High': return 'high-priority-notification';
      case 'Medium': return 'medium-priority-notification';
      case 'Low': return 'low-priority-notification';
      default: return 'default-notification';
    }
  }

  /**
   * Update notification status in local state
   */
  private updateNotificationStatus(notificationId: string, status: string): void {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(notification => {
      if (notification.id === notificationId) {
        return { ...notification, status: status as 'Unread' | 'Read' | 'Archived' };
      }
      return notification;
    });
    this.notificationsSubject.next(updatedNotifications);
  }

  // ===== API METHODS =====

  /**
   * Get latest notifications
   */
  getLatest(count: number = 5): Observable<NotificationDto[]> {
    return this.http.get<NotificationBadgeDto>(`${this.apiUrl}/latest?count=${count}`)
      .pipe(
        map(response => {
          this.unreadCountSubject.next(response.unreadCount);
          return response.latestNotifications;
        }),
        tap(notifications => {
          const currentNotifications = this.notificationsSubject.value;
          // Merge with existing notifications, avoiding duplicates
          const mergedNotifications = this.mergeNotifications(currentNotifications, notifications);
          this.notificationsSubject.next(mergedNotifications);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Get all notifications with filters and pagination
   */
  getAll(filters: NotificationFilterDto = {}): Observable<NotificationListResponseDto> {
    const params = new HttpParams()
      .set('page', filters.page?.toString() || '1')
      .set('pageSize', filters.pageSize?.toString() || '20');

    console.log('Getting notifications with filters:', filters);
    console.log('API URL:', `${this.apiUrl}`);
    console.log('Request params:', params.toString());

    return this.http.get<GeneralResponse<NotificationListResponseDto>>(`${this.apiUrl}`, { params })
      .pipe(
        tap(response => console.log('Notifications API response:', response)),
        map(response => response.data || { notifications: [], totalCount: 0, page: 1, pageSize: 20, totalPages: 0, hasNextPage: false, hasPreviousPage: false }),
        catchError(this.handleError)
      );
  }

  /**
   * Get unread count
   */
  getUnreadCount(): Observable<number> {
    return this.http.get<{ data: number }>(`${this.apiUrl}/unread-count`)
      .pipe(
        map(response => response.data),
        tap(count => this.unreadCountSubject.next(count)),
        catchError(this.handleError)
      );
  }

  /**
   * Get notification statistics
   */
  getStats(): Observable<NotificationStatsDto> {
    return this.http.get<GeneralResponse<NotificationStatsDto>>(`${this.apiUrl}/stats`)
      .pipe(
        map(response => response.data || { total: 0, unread: 0, read: 0, byType: {}, byPriority: {}, byCategory: {} }),
        catchError(this.handleError)
      );
  }

  /**
   * Mark notification as read
   */
  markAsRead(id: string): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            if (notification.id === id && !notification.isRead) {
              const currentUnreadCount = this.unreadCountSubject.value;
              this.unreadCountSubject.next(Math.max(0, currentUnreadCount - 1));
              return { ...notification, isRead: true, readAt: new Date() };
            }
            return notification;
          });
          this.notificationsSubject.next(updatedNotifications);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Mark multiple notifications as read
   */
  markMultipleAsRead(ids: string[]): Observable<unknown> {
    const request: BulkNotificationActionDto = {
      notificationIds: ids,
      action: 'mark-read'
    };

    return this.http.post(`${this.apiUrl}/bulk`, request)
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => {
            if (ids.includes(notification.id) && !notification.isRead) {
              return { ...notification, isRead: true, readAt: new Date() };
            }
            return notification;
          });
          this.notificationsSubject.next(updatedNotifications);

          // Update unread count
          const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
          this.unreadCountSubject.next(unreadCount);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/mark-all-read`, {})
      .pipe(
        tap(() => {
          // Update local state
          const currentNotifications = this.notificationsSubject.value;
          const updatedNotifications = currentNotifications.map(notification => ({
            ...notification,
            isRead: true,
            readAt: new Date()
          }));
          this.notificationsSubject.next(updatedNotifications);
          this.unreadCountSubject.next(0);
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete notification
   */
  delete(id: string): Observable<unknown> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          // Remove from local state
          const currentNotifications = this.notificationsSubject.value;
          const notification = currentNotifications.find(n => n.id === id);
          const updatedNotifications = currentNotifications.filter(n => n.id !== id);
          this.notificationsSubject.next(updatedNotifications);

          // Update unread count if notification was unread
          if (notification && !notification.isRead) {
            const currentUnreadCount = this.unreadCountSubject.value;
            this.unreadCountSubject.next(Math.max(0, currentUnreadCount - 1));
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Delete multiple notifications
   */
  deleteMultiple(ids: string[]): Observable<unknown> {
    const request: BulkNotificationActionDto = {
      notificationIds: ids,
      action: 'delete'
    };

    return this.http.post(`${this.apiUrl}/bulk`, request)
      .pipe(
        tap(() => {
          // Remove from local state
          const currentNotifications = this.notificationsSubject.value;
          const deletedNotifications = currentNotifications.filter(n => ids.includes(n.id));
          const updatedNotifications = currentNotifications.filter(n => !ids.includes(n.id));
          this.notificationsSubject.next(updatedNotifications);

          // Update unread count
          const unreadDeletedCount = deletedNotifications.filter(n => !n.isRead).length;
          const currentUnreadCount = this.unreadCountSubject.value;
          this.unreadCountSubject.next(Math.max(0, currentUnreadCount - unreadDeletedCount));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Track notification action
   */
  trackAction(id: string, action: 'read' | 'click' | 'action' | 'view', actionData?: string): Observable<unknown> {
    const request: NotificationActionDto = {
      action,
      timestamp: new Date(),
      actionData
    };

    return this.http.post(`${this.apiUrl}/${id}/action`, request)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get notification settings
   */
  getSettings(): Observable<NotificationSettingsDto> {
    return this.http.get<{ data: NotificationSettingsDto }>(`${this.apiUrl}/settings`)
      .pipe(
        map(response => response.data),
        catchError(this.handleError)
      );
  }

  /**
   * Update notification settings
   */
  updateSettings(settings: NotificationSettingsDto): Observable<unknown> {
    return this.http.put(`${this.apiUrl}/settings`, settings)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Get notification analytics
   */
  getAnalytics(fromDate?: Date, toDate?: Date): Observable<unknown> {
    let params = new HttpParams();
    if (fromDate) params = params.set('fromDate', fromDate.toISOString());
    if (toDate) params = params.set('toDate', toDate.toISOString());

    return this.http.get(`${this.apiUrl}/analytics`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // ===== UTILITY METHODS =====

  /**
   * Merge notifications avoiding duplicates
   */
  private mergeNotifications(existing: NotificationDto[], newNotifications: NotificationDto[]): NotificationDto[] {
    const existingIds = new Set(existing.map(n => n.id));
    const uniqueNew = newNotifications.filter(n => !existingIds.has(n.id));
    return [...uniqueNew, ...existing];
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: unknown): Observable<never> => {
    console.error('NotificationService error:', error);
    let errorMessage = 'حدث خطأ في النظام';
    
    if (error && typeof error === 'object' && 'error' in error && 
        error.error && typeof error.error === 'object' && 'message' in error.error) {
      errorMessage = (error.error as { message: string }).message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = (error as { message: string }).message;
    }

    this.snackBar.open(errorMessage, 'إغلاق', {
      duration: 5000,
      panelClass: 'error-notification',
      horizontalPosition: 'right',
      verticalPosition: 'top',
      direction: 'rtl'
    });

    return throwError(() => error);
  };

  /**
   * Get connection state
   */
  getConnectionState(): boolean {
    return this.connectionStateSubject.value;
  }

  /**
   * Clear all notifications from local state
   */
  clearNotifications(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}