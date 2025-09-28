import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule, Bell, BellRing } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { SignalRService, SignalRNotification } from '../../../core/services/signalr.service';
import { NotificationsService } from '../../../core/services/notifications.service';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatBadgeModule,
    MatMenuModule,
    MatButtonModule,
    MatTooltipModule,
    LucideAngularModule
  ],
  template: `
    <div class="notification-bell-container">
      <button 
        mat-icon-button 
        [matMenuTriggerFor]="notificationMenu"
        matTooltip="الإشعارات"
        class="notification-bell-button">
        <lucide-icon 
          [name]="hasUnreadNotifications ? 'bell-ring' : 'bell'" 
          size="24"
          [class.has-unread]="hasUnreadNotifications">
        </lucide-icon>
        <span 
          *ngIf="unreadCount > 0" 
          class="notification-badge"
          [class.many]="unreadCount > 99">
          {{ unreadCount > 99 ? '99+' : unreadCount }}
        </span>
      </button>

      <mat-menu #notificationMenu="matMenu" class="notification-menu">
        <div class="notification-header">
          <h3>الإشعارات</h3>
          <button 
            *ngIf="unreadCount > 0"
            mat-button 
            color="primary" 
            (click)="markAllAsRead()"
            class="mark-all-read-btn">
            تعيين الكل كمقروء
          </button>
        </div>

        <div class="notification-list">
          <div 
            *ngFor="let notification of recentNotifications; trackBy: trackByNotificationId"
            class="notification-item"
            [class.unread]="!notification.isRead"
            (click)="markAsRead(notification)">
            
            <div class="notification-icon">
              <span [innerHTML]="getNotificationIcon(notification.type)"></span>
            </div>
            
            <div class="notification-content">
              <div class="notification-title">{{ notification.title }}</div>
              <div class="notification-message">{{ notification.message }}</div>
              <div class="notification-time">{{ getTimeAgo(notification.createdAt) }}</div>
            </div>
            
            <div class="notification-actions">
              <button 
                mat-icon-button 
                (click)="deleteNotification(notification); $event.stopPropagation()"
                matTooltip="حذف">
                <lucide-icon name="x" size="16"></lucide-icon>
              </button>
            </div>
          </div>

          <div *ngIf="recentNotifications.length === 0" class="no-notifications">
            <lucide-icon name="bell-off" size="48" class="no-notifications-icon"></lucide-icon>
            <p>لا توجد إشعارات</p>
          </div>
        </div>

        <div class="notification-footer">
          <button mat-button color="primary" routerLink="/notifications">
            عرض جميع الإشعارات
          </button>
        </div>
      </mat-menu>
    </div>
  `,
  styles: [`
    .notification-bell-container {
      position: relative;
    }

    .notification-bell-button {
      position: relative;
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #f44336;
      color: white;
      border-radius: 50%;
      min-width: 18px;
      height: 18px;
      font-size: 11px;
      font-weight: 500;
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }

    .notification-badge.many {
      min-width: 24px;
      height: 18px;
      border-radius: 9px;
      font-size: 10px;
    }

    .has-unread {
      color: #ff9800;
      animation: ring 2s ease-in-out infinite;
    }

    @keyframes ring {
      0%, 100% { transform: rotate(0deg); }
      25% { transform: rotate(-10deg); }
      75% { transform: rotate(10deg); }
    }

    .notification-menu {
      width: 400px;
      max-height: 500px;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .notification-header h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 500;
    }

    .mark-all-read-btn {
      font-size: 12px;
      min-width: auto;
      padding: 4px 8px;
    }

    .notification-list {
      max-height: 300px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      padding: 12px 16px;
      border-bottom: 1px solid #f5f5f5;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .notification-item:hover {
      background-color: #f9f9f9;
    }

    .notification-item.unread {
      background-color: #e3f2fd;
      border-left: 3px solid #2196f3;
    }

    .notification-icon {
      margin-right: 12px;
      font-size: 20px;
      width: 24px;
      text-align: center;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 500;
      font-size: 14px;
      margin-bottom: 4px;
      color: #333;
    }

    .notification-message {
      font-size: 13px;
      color: #666;
      margin-bottom: 4px;
      line-height: 1.4;
    }

    .notification-time {
      font-size: 11px;
      color: #999;
    }

    .notification-actions {
      margin-left: 8px;
    }

    .no-notifications {
      text-align: center;
      padding: 40px 20px;
      color: #999;
    }

    .no-notifications-icon {
      margin-bottom: 12px;
      opacity: 0.5;
    }

    .notification-footer {
      padding: 12px 16px;
      border-top: 1px solid #e0e0e0;
      text-align: center;
    }

    /* Scrollbar styling */
    .notification-list::-webkit-scrollbar {
      width: 6px;
    }

    .notification-list::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    .notification-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .notification-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `]
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  private signalRService = inject(SignalRService);
  private notificationsService = inject(NotificationsService);
  
  private subscription = new Subscription();
  
  recentNotifications: SignalRNotification[] = [];
  unreadCount = 0;
  hasUnreadNotifications = false;

  ngOnInit() {
    // الاشتراك في إشعارات SignalR
    this.subscription.add(
      this.signalRService.notifications$.subscribe(notifications => {
        this.recentNotifications = notifications.slice(0, 10); // آخر 10 إشعارات
        this.updateUnreadCount();
      })
    );

    // بدء الاتصال بـ SignalR
    this.signalRService.startConnection();
    
    // طلب إذن الإشعارات من المتصفح
    this.signalRService.requestNotificationPermission();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  private updateUnreadCount() {
    this.unreadCount = this.recentNotifications.filter(n => !n.isRead).length;
    this.hasUnreadNotifications = this.unreadCount > 0;
  }

  markAsRead(notification: SignalRNotification) {
    if (!notification.isRead) {
      this.notificationsService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }
  }

  markAllAsRead() {
    const unreadNotifications = this.recentNotifications.filter(n => !n.isRead);
    if (unreadNotifications.length > 0) {
      this.notificationsService.markAllAsRead().subscribe({
        next: () => {
          this.recentNotifications.forEach(n => n.isRead = true);
          this.updateUnreadCount();
        },
        error: (error) => {
          console.error('Error marking all notifications as read:', error);
        }
      });
    }
  }

  deleteNotification(notification: SignalRNotification) {
    // يمكن إضافة API call لحذف الإشعار
    const index = this.recentNotifications.findIndex(n => n.id === notification.id);
    if (index > -1) {
      this.recentNotifications.splice(index, 1);
      this.updateUnreadCount();
    }
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'CompetitionAnalysis':
        return '📊';
      case 'PerformanceImprovement':
        return '📈';
      case 'SmartRecommendation':
        return '🤖';
      case 'MarketInsights':
        return '💡';
      case 'AdPublished':
        return '✅';
      case 'AdExpired':
        return '⏰';
      case 'NewMessage':
        return '💬';
      case 'ContactRequest':
        return '📞';
      case 'Security':
        return '🔒';
      case 'Payment':
        return '💳';
      case 'Subscription':
        return '📋';
      case 'ABTesting':
        return '🧪';
      case 'NewCompetitor':
        return '👥';
      case 'CheaperCompetitor':
        return '💰';
      default:
        return '🔔';
    }
  }

  getTimeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'الآن';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `منذ ${minutes} دقيقة`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `منذ ${hours} ساعة`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `منذ ${days} يوم`;
    }
  }

  trackByNotificationId(index: number, notification: SignalRNotification): string {
    return notification.id;
  }
}
