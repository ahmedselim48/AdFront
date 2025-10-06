import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';
import { NotificationDto, NotificationStatsDto } from '../../models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LucideAngularModule
  ],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {
  // Data
  notifications: NotificationDto[] = [];
  stats: NotificationStatsDto | null = null;
  unreadCount = 0;
  isLoading = true;
  error: string | null = null;

  // Filters
  selectedFilter: 'all' | 'unread' | 'read' | 'urgent' = 'all';
  selectedCategory: string | null = null;

  // State
  selectedNotifications: Set<string> = new Set();
  isSelectMode = false;

  // Subscriptions
  private subscriptions = new Subscription();

  constructor(
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
    this.loadStats();
    this.subscribeToNotifications();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // Load data
  loadNotifications(): void {
    this.isLoading = true;
    this.error = null;

    this.subscriptions.add(
      this.notificationService.getAll({ page: 1, pageSize: 50 }).subscribe({
        next: (response) => {
          this.notifications = response.notifications || [];
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading notifications:', error);
          this.error = 'فشل في تحميل الإشعارات';
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      })
    );
  }

  loadStats(): void {
    this.subscriptions.add(
      this.notificationService.getStats().subscribe({
        next: (stats) => {
          this.stats = stats;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      })
    );
  }

  subscribeToNotifications(): void {
    // Subscribe to real-time notifications
    this.subscriptions.add(
      this.notificationService.notifications$.subscribe(notifications => {
        this.notifications = notifications;
        this.cdr.detectChanges();
      })
    );

    // Subscribe to unread count
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.unreadCount = count;
        this.cdr.detectChanges();
      })
    );
  }

  // Filter methods
  getFilteredNotifications(): NotificationDto[] {
    let filtered = this.notifications;

    // Apply status filter
    switch (this.selectedFilter) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'read':
        filtered = filtered.filter(n => n.isRead);
        break;
      case 'urgent':
        filtered = filtered.filter(n => n.priority === 'Urgent' || n.priority === 'High');
        break;
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(n => n.category === this.selectedCategory);
    }

    return filtered;
  }

  onFilterChange(filter: 'all' | 'unread' | 'read' | 'urgent'): void {
    this.selectedFilter = filter;
    this.selectedNotifications.clear();
    this.isSelectMode = false;
  }

  onCategoryChange(category: string | null): void {
    this.selectedCategory = category;
    this.selectedNotifications.clear();
    this.isSelectMode = false;
  }

  // Notification actions
  markAsRead(notification: NotificationDto): void {
    if (notification.isRead) return;

    this.subscriptions.add(
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          notification.isRead = true;
          notification.readAt = new Date();
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error marking as read:', error);
        }
      })
    );
  }

  markAllAsRead(): void {
    this.subscriptions.add(
      this.notificationService.markAllAsRead().subscribe({
        next: () => {
          this.notifications.forEach(n => {
            n.isRead = true;
            n.readAt = new Date();
          });
          this.unreadCount = 0;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error marking all as read:', error);
        }
      })
    );
  }

  deleteNotification(notification: NotificationDto): void {
    this.subscriptions.add(
      this.notificationService.delete(notification.id).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => n.id !== notification.id);
          if (!notification.isRead) {
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting notification:', error);
        }
      })
    );
  }

  deleteSelected(): void {
    const selectedIds = Array.from(this.selectedNotifications);
    if (selectedIds.length === 0) return;

    this.subscriptions.add(
      this.notificationService.deleteMultiple(selectedIds).subscribe({
        next: () => {
          this.notifications = this.notifications.filter(n => !selectedIds.includes(n.id));
          this.selectedNotifications.clear();
          this.isSelectMode = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error deleting selected notifications:', error);
        }
      })
    );
  }

  // Selection methods
  toggleSelection(notificationId: string): void {
    if (this.selectedNotifications.has(notificationId)) {
      this.selectedNotifications.delete(notificationId);
    } else {
      this.selectedNotifications.add(notificationId);
    }
    this.isSelectMode = this.selectedNotifications.size > 0;
  }

  selectAll(): void {
    const filteredNotifications = this.getFilteredNotifications();
    filteredNotifications.forEach(n => this.selectedNotifications.add(n.id));
    this.isSelectMode = true;
  }

  clearSelection(): void {
    this.selectedNotifications.clear();
    this.isSelectMode = false;
  }

  // Utility methods
  getPriorityIcon(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'alert-triangle';
      case 'High': return 'trending-up';
      case 'Medium': return 'info';
      case 'Low': return 'chevron-down';
      default: return 'bell';
    }
  }

  getPriorityColor(priority: string): string {
    switch (priority) {
      case 'Urgent': return 'urgent';
      case 'High': return 'high';
      case 'Medium': return 'medium';
      case 'Low': return 'low';
      default: return 'default';
    }
  }

  getCategoryIcon(category: string): string {
    switch (category) {
      case 'Ad': return 'trending-up';
      case 'Chat': return 'message-circle';
      case 'System': return 'settings';
      case 'Payment': return 'credit-card';
      case 'Security': return 'shield';
      default: return 'bell';
    }
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return new Date(date).toLocaleDateString('ar-SA');
  }

  onNotificationClick(notification: NotificationDto): void {
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Track click action
    this.subscriptions.add(
      this.notificationService.trackAction(notification.id, 'click').subscribe()
    );

    // Navigate if action URL exists
    if (notification.actionUrl) {
      // Handle navigation
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  refreshNotifications(): void {
    this.loadNotifications();
    this.loadStats();
  }

  // Track by function for performance
  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.id;
  }

  // Handle action click
  onActionClick(notification: NotificationDto): void {
    // Mark as read if not already read
    if (!notification.isRead) {
      this.markAsRead(notification);
    }

    // Track action click
    this.subscriptions.add(
      this.notificationService.trackAction(notification.id, 'action').subscribe()
    );

    // Handle different action types
    if (notification.actionText) {
      switch (notification.actionText.toLowerCase()) {
        case 'عرض الملخص':
        case 'view summary':
          this.showNotificationSummary(notification);
          break;
        case 'عرض التفاصيل':
        case 'view details':
          this.viewNotificationDetails(notification);
          break;
        case 'الرد':
        case 'reply':
          this.replyToNotification(notification);
          break;
        default:
          // Default action - navigate to action URL if exists
          if (notification.actionUrl) {
            console.log('Navigate to:', notification.actionUrl);
            // You can add navigation logic here
          }
          break;
      }
    }
  }

  // Show notification summary
  private showNotificationSummary(notification: NotificationDto): void {
    console.log('Showing summary for notification:', notification);
    // You can implement a summary dialog or navigate to a summary page
    // For now, we'll just log the notification details
    alert(`ملخص الإشعار:\n\nالعنوان: ${notification.title}\n\nالرسالة: ${notification.message}\n\nالتاريخ: ${this.formatDate(notification.createdAt)}`);
  }

  // View notification details
  private viewNotificationDetails(notification: NotificationDto): void {
    console.log('Viewing details for notification:', notification);
    // Navigate to notification details page or show details dialog
    alert(`تفاصيل الإشعار:\n\nالعنوان: ${notification.title}\n\nالرسالة: ${notification.message}\n\nالفئة: ${notification.category || 'غير محدد'}\n\nالأولوية: ${notification.priority}\n\nالتاريخ: ${this.formatDate(notification.createdAt)}`);
  }

  // Reply to notification
  private replyToNotification(notification: NotificationDto): void {
    console.log('Replying to notification:', notification);
    // Open reply dialog or navigate to reply page
    const reply = prompt(`الرد على الإشعار:\n\n${notification.title}\n\nاكتب ردك:`);
    if (reply) {
      console.log('Reply:', reply);
      // Send reply to backend
      alert('تم إرسال الرد بنجاح!');
    }
  }
}