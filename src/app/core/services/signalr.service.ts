import { Injectable, inject } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';
import { NotificationDto, NotificationType } from '../../models/notifications.models';

export interface SignalRNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

@Injectable({
  providedIn: 'root'
})
export class SignalRService {
  private hubConnection!: HubConnection;
  private notificationsSubject = new BehaviorSubject<SignalRNotification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private authService = inject(AuthService);

  constructor() {
    this.initializeConnection();
  }

  private initializeConnection() {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiBaseUrl}/notificationHub`, {
        accessTokenFactory: () => {
          // إرجاع JWT token من AuthService
          return this.authService.accessToken || '';
        }
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // استقبال الإشعارات الجديدة
    this.hubConnection.on('ReceiveNotification', (notification: SignalRNotification) => {
      console.log('Received notification:', notification);
      this.addNotification(notification);
      this.showBrowserNotification(notification);
    });

    // استقبال تحديثات الإشعارات
    this.hubConnection.on('NotificationUpdated', (notification: SignalRNotification) => {
      this.updateNotification(notification);
    });

    // استقبال حذف الإشعارات
    this.hubConnection.on('NotificationDeleted', (notificationId: string) => {
      this.removeNotification(notificationId);
    });

    // معالجة أخطاء الاتصال
    this.hubConnection.onclose((error) => {
      if (error) {
        console.error('SignalR connection closed with error:', error);
      } else {
        console.log('SignalR connection closed');
      }
    });
  }

  public async startConnection(): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      try {
        await this.hubConnection.start();
        console.log('SignalR connection started');
        
        // الانضمام لمجموعة المستخدم
        const userId = this.getCurrentUserId();
        if (userId) {
          await this.hubConnection.invoke('JoinUserGroup', userId);
          console.log('Joined user group:', userId);
        }
      } catch (error) {
        console.error('Error starting SignalR connection:', error);
      }
    }
  }

  public async stopConnection(): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      try {
        const userId = this.getCurrentUserId();
        if (userId) {
          await this.hubConnection.invoke('LeaveUserGroup', userId);
        }
        await this.hubConnection.stop();
        console.log('SignalR connection stopped');
      } catch (error) {
        console.error('Error stopping SignalR connection:', error);
      }
    }
  }

  private addNotification(notification: SignalRNotification) {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([notification, ...currentNotifications]);
  }

  private updateNotification(notification: SignalRNotification) {
    const currentNotifications = this.notificationsSubject.value;
    const updatedNotifications = currentNotifications.map(n => 
      n.id === notification.id ? notification : n
    );
    this.notificationsSubject.next(updatedNotifications);
  }

  private removeNotification(notificationId: string) {
    const currentNotifications = this.notificationsSubject.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== notificationId);
    this.notificationsSubject.next(filteredNotifications);
  }

  private showBrowserNotification(notification: SignalRNotification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/assets/icons/notification-icon.png',
        badge: '/assets/icons/badge-icon.png',
        tag: notification.id,
        requireInteraction: notification.type === 'CompetitionAnalysis' || notification.type === 'Security'
      });
    }
  }

  private getCurrentUserId(): string | null {
    // استخراج User ID من AuthService
    const user = this.authService.currentUser;
    return user?.id || null;
  }

  // طلب إذن الإشعارات من المتصفح
  public async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // إرسال إشعار مخصص (اختياري)
  public async sendCustomNotification(userId: string, title: string, message: string): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Connected) {
      try {
        await this.hubConnection.invoke('SendNotification', userId, title, message);
      } catch (error) {
        console.error('Error sending custom notification:', error);
      }
    }
  }

  // الحصول على حالة الاتصال
  public getConnectionState(): HubConnectionState {
    return this.hubConnection.state;
  }

  // إعادة الاتصال يدوياً
  public async reconnect(): Promise<void> {
    if (this.hubConnection.state === HubConnectionState.Disconnected) {
      await this.startConnection();
    }
  }

  // تحويل SignalRNotification إلى NotificationDto
  public convertToNotificationDto(signalRNotification: SignalRNotification): NotificationDto {
    return {
      id: signalRNotification.id,
      title: signalRNotification.title,
      message: signalRNotification.message,
      type: signalRNotification.type as NotificationType,
      isRead: signalRNotification.isRead,
      createdAt: new Date(signalRNotification.createdAt),
      data: signalRNotification.data
    };
  }

  // تحويل مصفوفة SignalRNotification إلى NotificationDto
  public convertToNotificationDtoArray(signalRNotifications: SignalRNotification[]): NotificationDto[] {
    return signalRNotifications.map(notification => this.convertToNotificationDto(notification));
  }
}
