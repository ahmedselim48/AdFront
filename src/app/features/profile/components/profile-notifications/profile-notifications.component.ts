import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Bell, Check, Trash2, Settings, Filter, Search, RefreshCw, Eye, EyeOff } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { NotificationsService } from '../../../../core/services/notifications.service';
import { NotificationDto, NotificationSettingsDto, NotificationFilters } from '../../../../models/profile.models';

@Component({
  selector: 'app-profile-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './profile-notifications.component.html',
  styleUrls: ['./profile-notifications.component.scss']
})
export class ProfileNotificationsComponent implements OnInit, OnDestroy {
  notifications: NotificationDto[] = [];
  filteredNotifications: NotificationDto[] = [];
  settings: NotificationSettingsDto | null = null;
  isLoading = false;
  isSaving = false;
  
  // Filters
  filterForm!: FormGroup;
  showUnreadOnly = false;
  
  // Settings form
  settingsForm!: FormGroup;
  showSettings = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 20;
  totalPages = 1;

  private destroy$ = new Subject<void>();
  private notificationsService = inject(NotificationsService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeFilterForm();
    this.initializeSettingsForm();
    this.loadNotifications();
    this.loadSettings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm() {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      type: [''],
      isRead: [null]
    });

    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  private initializeSettingsForm() {
    this.settingsForm = this.fb.group({
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      marketingEmails: [true],
      adUpdates: [true],
      chatMessages: [true],
      systemUpdates: [true],
      performanceAlerts: [true],
      competitionReports: [true],
      securityAlerts: [true]
    });
  }

  loadNotifications() {
    this.isLoading = true;
    
    this.notificationsService.getNotifications(this.currentPage, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.notifications = response.data;
          this.applyFilters();
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading notifications:', error);
        this.toastr.error('فشل في تحميل الإشعارات', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  loadSettings() {
    this.notificationsService.getNotificationSettings().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.settings = response.data;
          this.settingsForm.patchValue(response.data);
        }
      },
      error: (error: any) => {
        console.error('Error loading notification settings:', error);
      }
    });
  }

  applyFilters() {
    const formValue = this.filterForm.value;
    let filtered = [...this.notifications];

    // Search term filter
    if (formValue.searchTerm) {
      const searchLower = formValue.searchTerm.toLowerCase();
      filtered = filtered.filter(notification => 
        notification.title.toLowerCase().includes(searchLower) ||
        notification.message.toLowerCase().includes(searchLower) ||
        notification.type.toLowerCase().includes(searchLower)
      );
    }

    // Type filter
    if (formValue.type) {
      filtered = filtered.filter(notification => notification.type === formValue.type);
    }

    // Read status filter
    if (formValue.isRead !== null) {
      filtered = filtered.filter(notification => notification.isRead === formValue.isRead);
    }

    // Unread only filter
    if (this.showUnreadOnly) {
      filtered = filtered.filter(notification => !notification.isRead);
    }

    this.filteredNotifications = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredNotifications.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedNotifications(): NotificationDto[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredNotifications.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onToggleUnreadOnly() {
    this.showUnreadOnly = !this.showUnreadOnly;
    this.applyFilters();
  }

  onMarkAsRead(notification: NotificationDto) {
    if (!notification.isRead) {
      this.notificationsService.markAsRead(notification.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            notification.isRead = true;
            this.toastr.success('تم تمييز الإشعار كمقروء', 'تم');
          }
        },
        error: (error: any) => {
          console.error('Error marking notification as read:', error);
          this.toastr.error('فشل في تمييز الإشعار كمقروء', 'خطأ');
        }
      });
    }
  }

  onMarkAllAsRead() {
    this.isSaving = true;
    
    this.notificationsService.markAllAsRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success) {
          this.notifications.forEach(notification => notification.isRead = true);
          this.applyFilters();
          this.toastr.success('تم تمييز جميع الإشعارات كمقروءة', 'تم');
        }
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.toastr.error('فشل في تمييز الإشعارات كمقروءة', 'خطأ');
        this.isSaving = false;
      }
    });
  }

  onDeleteNotification(notification: NotificationDto) {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      this.notificationsService.deleteNotification(notification.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notifications = this.notifications.filter(n => n.id !== notification.id);
            this.applyFilters();
            this.toastr.success('تم حذف الإشعار', 'تم');
          }
        },
        error: (error: any) => {
          console.error('Error deleting notification:', error);
          this.toastr.error('فشل في حذف الإشعار', 'خطأ');
        }
      });
    }
  }

  onDeleteAllNotifications() {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      this.isSaving = true;
      
      this.notificationsService.deleteAllNotifications().pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notifications = [];
            this.applyFilters();
            this.toastr.success('تم حذف جميع الإشعارات', 'تم');
          }
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('Error deleting all notifications:', error);
          this.toastr.error('فشل في حذف الإشعارات', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onToggleSettings() {
    this.showSettings = !this.showSettings;
  }

  onSaveSettings() {
    if (this.settingsForm.valid) {
      this.isSaving = true;
      
      const settingsData = this.settingsForm.value;
      this.notificationsService.updateNotificationSettings(settingsData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.settings = settingsData;
            this.toastr.success('تم حفظ إعدادات الإشعارات', 'تم');
            this.showSettings = false;
          } else {
            this.toastr.error('فشل في حفظ إعدادات الإشعارات', 'خطأ');
          }
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('Error updating notification settings:', error);
          this.toastr.error('فشل في حفظ إعدادات الإشعارات', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onRefresh() {
    this.loadNotifications();
    this.toastr.success('تم تحديث الإشعارات', 'تم');
  }

  getNotificationIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'ad_published': return 'eye';
      case 'ad_expired': return 'calendar';
      case 'message_received': return 'message-circle';
      case 'performance_alert': return 'trending-up';
      case 'competition_report': return 'bar-chart-3';
      case 'security_alert': return 'shield';
      case 'system_update': return 'settings';
      default: return 'bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type.toLowerCase()) {
      case 'ad_published': return 'success';
      case 'ad_expired': return 'warn';
      case 'message_received': return 'primary';
      case 'performance_alert': return 'accent';
      case 'competition_report': return 'info';
      case 'security_alert': return 'warn';
      case 'system_update': return 'basic';
      default: return 'primary';
    }
  }

  formatDate(date: string): string {
    const notificationDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - notificationDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return notificationDate.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return notificationDate.toLocaleDateString('ar-SA', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return notificationDate.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.id;
  }

  getReadNotificationsCount(): number {
    return this.notifications.filter(n => n.isRead).length;
  }
}
