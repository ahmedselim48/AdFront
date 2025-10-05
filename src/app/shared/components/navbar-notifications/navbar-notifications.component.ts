import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, combineLatest } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto, NotificationPriority } from '../../../models/notification.model';

@Component({
  selector: 'app-navbar-notifications',
  standalone: true,
  imports: [
    CommonModule,
    MatMenuModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    LucideAngularModule
  ],
  templateUrl: './navbar-notifications.component.html',
  styleUrls: ['./navbar-notifications.component.scss']
})
export class NavbarNotificationsComponent implements OnInit, OnDestroy {
  @Input() showBadge: boolean = true;
  
  notifications: NotificationDto[] = [];
  unreadCount: number = 0;
  isConnected: boolean = false;
  isLoading: boolean = false;
  
  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSubscriptions(): void {
    // Subscribe to notifications and unread count
    combineLatest([
      this.notificationService.notifications$,
      this.notificationService.unreadCount$,
      this.notificationService.connectionState$
    ])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([notifications, unreadCount, isConnected]) => {
      console.log('Navbar notifications updated:', { notifications: notifications.length, unreadCount, isConnected });
      this.notifications = notifications.slice(0, 5); // Show latest 5
      this.unreadCount = unreadCount;
      this.isConnected = isConnected;
    });

    // Load initial notifications
    this.notificationService.getLatest(5).subscribe({
      next: (notifications) => {
        console.log('Loaded initial notifications for navbar:', notifications.length);
        this.notifications = notifications;
      },
      error: (error) => {
        console.error('Error loading initial notifications:', error);
      }
    });
  }

  /**
   * Handle notification click
   */
  onNotificationClick(notification: NotificationDto, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    // Mark as read if not already read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          // Track click action
          this.notificationService.trackAction(notification.id, 'click').subscribe();
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }

    // Navigate to action URL if present
    if (notification.actionUrl) {
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  /**
   * Handle view all notifications
   */
  onViewAll(): void {
    this.router.navigate(['/profile/notifications']);
  }

  /**
   * Handle mark all as read
   */
  onMarkAllAsRead(): void {
    if (this.unreadCount === 0) return;

    this.isLoading = true;
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.isLoading = false;
      }
    });
  }

  /**
   * Get notification icon based on category
   */
  getNotificationIcon(category: string): string {
    switch (category) {
      case 'Ad': return 'campaign';
      case 'Chat': return 'chat';
      case 'System': return 'settings';
      case 'Security': return 'security';
      case 'Payment': return 'payment';
      case 'Performance': return 'trending_up';
      case 'Competition': return 'analytics';
      case 'Analysis': return 'assessment';
      case 'Insights': return 'lightbulb';
      case 'Recommendation': return 'recommend';
      case 'Trends': return 'trending_up';
      case 'Contact': return 'contact_phone';
      case 'Subscription': return 'subscriptions';
      default: return 'notifications';
    }
  }

  /**
   * Get priority color class
   */
  getPriorityClass(priority: NotificationPriority): string {
    switch (priority) {
      case 'Urgent': return 'priority-urgent';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-default';
    }
  }

  /**
   * Get relative time string
   */
  getRelativeTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
    } else if (hours > 0) {
      return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
    } else if (minutes > 0) {
      return `منذ ${minutes} ${minutes === 1 ? 'دقيقة' : 'دقائق'}`;
    } else {
      return 'الآن';
    }
  }

  /**
   * Check if notification is recent (less than 1 hour)
   */
  isRecentNotification(date: Date): boolean {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return diff < 60 * 60 * 1000; // 1 hour
  }

  /**
   * Get connection status text
   */
  getConnectionStatusText(): string {
    return this.isConnected ? 'متصل' : 'غير متصل';
  }

  /**
   * Get connection status class
   */
  getConnectionStatusClass(): string {
    return this.isConnected ? 'connected' : 'disconnected';
  }

  /**
   * Track by function for ngFor
   */
  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.id;
  }
}
