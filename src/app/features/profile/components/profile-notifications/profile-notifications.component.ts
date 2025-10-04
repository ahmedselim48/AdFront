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

import { NotificationService } from '../../../../core/services/notification.service';
import { 
  NotificationDto, 
  NotificationSettingsDto, 
  NotificationFilterDto,
  NotificationListResponseDto,
  NotificationStatsDto
} from '../../../../models/notification.model';

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
  totalCount = 0;
  
  // Connection state
  isConnected = false;
  connectionError = '';
  
  // Stats
  stats: NotificationStatsDto | null = null;

  private destroy$ = new Subject<void>();
  private notificationService = inject(NotificationService);
  private toastr = inject(ToastrService);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeFilterForm();
    this.initializeSettingsForm();
    this.subscribeToNotifications();
    this.subscribeToConnectionState();
    this.loadNotifications();
    this.loadSettings();
    this.loadStats();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private subscribeToNotifications() {
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
        this.applyFilters();
      });
  }

  private subscribeToConnectionState() {
    this.notificationService.connectionState$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isConnected => {
        this.isConnected = isConnected;
      });

    this.notificationService.connectionError$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => {
        this.connectionError = error;
        if (error) {
          this.toastr.warning(error, 'تحذير');
        }
      });
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
      // General notification settings
      emailNotifications: [true],
      pushNotifications: [true],
      smsNotifications: [false],
      
      // Email specific settings
      emailAdUpdates: [true],
      emailChatMessages: [true],
      emailSystemAlerts: [true],
      emailSecurityAlerts: [true],
      emailPerformanceAlerts: [true],
      emailMarketingEmails: [true],
      
      // Push notification settings
      pushAdUpdates: [true],
      pushChatMessages: [true],
      pushSystemAlerts: [true],
      pushSecurityAlerts: [true],
      pushPerformanceAlerts: [true],
      
      // SMS settings
      smsSecurityAlerts: [false],
      smsPaymentAlerts: [false],
      
      // Quiet hours settings
      enableQuietHours: [false],
      quietHoursStart: ['22:00'],
      quietHoursEnd: ['08:00'],
      timeZone: ['Asia/Riyadh'],
      
      // Frequency settings
      emailFrequency: ['Daily'],
      pushFrequency: ['Instant'],
      
      // Priority settings
      receiveLowPriority: [true],
      receiveMediumPriority: [true],
      receiveHighPriority: [true],
      receiveUrgentPriority: [true]
    });
  }

  loadNotifications() {
    this.isLoading = true;
    
    const filters: NotificationFilterDto = {
      page: this.currentPage,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    this.notificationService.getAll(filters).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: NotificationListResponseDto) => {
        // Update local state through service
        this.notifications = response.notifications;
        this.totalCount = response.totalCount;
        this.totalPages = response.totalPages;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: unknown) => {
        console.error('Error loading notifications:', error);
        this.toastr.error('فشل في تحميل الإشعارات', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  loadSettings() {
    this.notificationService.getSettings().pipe(takeUntil(this.destroy$)).subscribe({
      next: (settings: NotificationSettingsDto) => {
        this.settings = settings;
        this.settingsForm.patchValue(settings);
      },
      error: (error: unknown) => {
        console.error('Error loading notification settings:', error);
      }
    });
  }

  loadStats() {
    this.notificationService.getStats().pipe(takeUntil(this.destroy$)).subscribe({
      next: (stats: NotificationStatsDto) => {
        this.stats = stats;
      },
      error: (error: unknown) => {
        console.error('Error loading notification stats:', error);
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
        notification.type.toLowerCase().includes(searchLower) ||
        notification.category.toLowerCase().includes(searchLower)
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

    // Sort by priority and date
    filtered.sort((a, b) => {
      // First by priority
      const priorityOrder = { 'Urgent': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

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
      this.notificationService.markAsRead(notification.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          // Local state will be updated automatically through the service
          this.toastr.success('تم تمييز الإشعار كمقروء', 'تم');
          // Track the action
          this.notificationService.trackAction(notification.id, 'read').subscribe();
        },
        error: (error: unknown) => {
          console.error('Error marking notification as read:', error);
          this.toastr.error('فشل في تمييز الإشعار كمقروء', 'خطأ');
        }
      });
    }
  }

  onMarkAllAsRead() {
    this.isSaving = true;
    
    this.notificationService.markAllAsRead().pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        // Local state will be updated automatically through the service
        this.applyFilters();
        this.toastr.success('تم تمييز جميع الإشعارات كمقروءة', 'تم');
        this.isSaving = false;
      },
      error: (error: unknown) => {
        console.error('Error marking all notifications as read:', error);
        this.toastr.error('فشل في تمييز الإشعارات كمقروءة', 'خطأ');
        this.isSaving = false;
      }
    });
  }

  onDeleteNotification(notification: NotificationDto) {
    if (confirm('هل أنت متأكد من حذف هذا الإشعار؟')) {
      this.notificationService.delete(notification.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          // Local state will be updated automatically through the service
          this.applyFilters();
          this.toastr.success('تم حذف الإشعار', 'تم');
        },
        error: (error: unknown) => {
          console.error('Error deleting notification:', error);
          this.toastr.error('فشل في حذف الإشعار', 'خطأ');
        }
      });
    }
  }

  onDeleteAllNotifications() {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      this.isSaving = true;
      
      const allIds = this.notifications.map(n => n.id);
      this.notificationService.deleteMultiple(allIds).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          // Local state will be updated automatically through the service
          this.applyFilters();
          this.toastr.success('تم حذف جميع الإشعارات', 'تم');
          this.isSaving = false;
        },
        error: (error: unknown) => {
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
      
      const settingsData = this.settingsForm.value as NotificationSettingsDto;
      this.notificationService.updateSettings(settingsData).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.settings = settingsData;
          this.toastr.success('تم حفظ إعدادات الإشعارات', 'تم');
          this.showSettings = false;
          this.isSaving = false;
        },
        error: (error: unknown) => {
          console.error('Error updating notification settings:', error);
          this.toastr.error('فشل في حفظ إعدادات الإشعارات', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onRefresh() {
    this.loadNotifications();
    this.loadStats();
    this.toastr.success('تم تحديث الإشعارات', 'تم');
  }

  getNotificationIcon(type: string): string {
    switch (type.toLowerCase()) {
      // Ad related
      case 'adpublished': return 'eye';
      case 'adpublishfailed': return 'x-circle';
      case 'adexpired': return 'calendar';
      case 'adstatuschanged': return 'refresh-cw';
      
      // Competition related
      case 'competitionanalysis': return 'bar-chart-3';
      case 'competitionreport': return 'file-text';
      case 'newcompetitor': return 'user-plus';
      case 'cheapercompetitor': return 'trending-down';
      
      // Performance related
      case 'performancealert': return 'trending-up';
      case 'performanceimprovement': return 'trending-up';
      case 'weeklysummary': return 'calendar';
      case 'dailyreport': return 'file-text';
      case 'abtesting': return 'flask';
      
      // Market insights
      case 'marketinsights': return 'lightbulb';
      case 'smartrecommendation': return 'zap';
      case 'trendingcategory': return 'trending-up';
      
      // Chat related
      case 'newmessage': return 'message-circle';
      case 'contactrequest': return 'user-plus';
      case 'messagereaction': return 'heart';
      
      // Security related
      case 'security': return 'shield';
      case 'accountsecurity': return 'shield-check';
      case 'passwordchanged': return 'key';
      case 'emailverification': return 'mail';
      
      // Payment related
      case 'payment': return 'credit-card';
      case 'subscriptionexpiring': return 'clock';
      case 'subscriptionrenewed': return 'check-circle';
      case 'subscriptioncancelled': return 'x-circle';
      
      // System related
      case 'systemmaintenance': return 'wrench';
      case 'systemupdate': return 'settings';
      case 'featureannouncement': return 'megaphone';
      
      // General
      case 'general': return 'info';
      case 'broadcast': return 'radio';
      case 'group': return 'users';
      case 'urgent': return 'alert-triangle';
      case 'highpriority': return 'star';
      
      default: return 'bell';
    }
  }

  getNotificationColor(type: string): string {
    switch (type.toLowerCase()) {
      // Ad related - Green for success, Orange for warnings
      case 'adpublished': return 'success';
      case 'adpublishfailed': return 'error';
      case 'adexpired': return 'warn';
      case 'adstatuschanged': return 'info';
      
      // Competition related - Blue
      case 'competitionanalysis': return 'primary';
      case 'competitionreport': return 'primary';
      case 'newcompetitor': return 'info';
      case 'cheapercompetitor': return 'warn';
      
      // Performance related - Purple/Accent
      case 'performancealert': return 'accent';
      case 'performanceimprovement': return 'success';
      case 'weeklysummary': return 'info';
      case 'dailyreport': return 'info';
      case 'abtesting': return 'accent';
      
      // Market insights - Blue
      case 'marketinsights': return 'primary';
      case 'smartrecommendation': return 'accent';
      case 'trendingcategory': return 'success';
      
      // Chat related - Blue
      case 'newmessage': return 'primary';
      case 'contactrequest': return 'info';
      case 'messagereaction': return 'accent';
      
      // Security related - Red/Orange
      case 'security': return 'warn';
      case 'accountsecurity': return 'error';
      case 'passwordchanged': return 'warn';
      case 'emailverification': return 'info';
      
      // Payment related - Green/Orange
      case 'payment': return 'success';
      case 'subscriptionexpiring': return 'warn';
      case 'subscriptionrenewed': return 'success';
      case 'subscriptioncancelled': return 'error';
      
      // System related - Gray
      case 'systemmaintenance': return 'basic';
      case 'systemupdate': return 'basic';
      case 'featureannouncement': return 'accent';
      
      // General - Default colors
      case 'general': return 'primary';
      case 'broadcast': return 'accent';
      case 'group': return 'info';
      case 'urgent': return 'error';
      case 'highpriority': return 'warn';
      
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

  onNotificationClick(notification: NotificationDto) {
    // Track click action
    this.notificationService.trackAction(notification.id, 'click').subscribe();
    
    // Mark as read if not already read
    if (!notification.isRead) {
      this.onMarkAsRead(notification);
    }
    
    // Handle action if available
    if (notification.actionUrl) {
      // Navigate to action URL or handle action
      console.log('Navigate to:', notification.actionUrl);
    }
  }

  onNotificationAction(notification: NotificationDto) {
    // Track action
    this.notificationService.trackAction(notification.id, 'action', notification.actionType).subscribe();
    
    // Handle specific action based on type
    switch (notification.actionType) {
      case 'View':
        if (notification.actionUrl) {
          // Navigate to URL
          console.log('Navigate to:', notification.actionUrl);
        }
        break;
      case 'Delete':
        this.onDeleteNotification(notification);
        break;
      default:
        console.log('Unknown action type:', notification.actionType);
    }
  }

  getConnectionStatusText(): string {
    if (this.isConnected) {
      return 'متصل';
    } else if (this.connectionError) {
      return 'خطأ في الاتصال';
    } else {
      return 'غير متصل';
    }
  }

  getConnectionStatusClass(): string {
    if (this.isConnected) {
      return 'connected';
    } else if (this.connectionError) {
      return 'error';
    } else {
      return 'disconnected';
    }
  }

  getPriorityClass(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'urgent';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      default: return 'medium';
    }
  }

  getCategoryClass(category: string): string {
    switch (category.toLowerCase()) {
      case 'ad': return 'ad-category';
      case 'chat': return 'chat-category';
      case 'system': return 'system-category';
      case 'security': return 'security-category';
      case 'payment': return 'payment-category';
      case 'analysis': return 'analysis-category';
      case 'performance': return 'performance-category';
      case 'competition': return 'competition-category';
      case 'insights': return 'insights-category';
      case 'recommendation': return 'recommendation-category';
      case 'trends': return 'trends-category';
      case 'contact': return 'contact-category';
      case 'subscription': return 'subscription-category';
      case 'general': return 'general-category';
      case 'group': return 'group-category';
      default: return 'general-category';
    }
  }

  getNotificationTypeText(type: string): string {
    switch (type.toLowerCase()) {
      case 'adpublished': return 'تم نشر الإعلان';
      case 'adpublishfailed': return 'فشل في نشر الإعلان';
      case 'adexpired': return 'انتهت صلاحية الإعلان';
      case 'adstatuschanged': return 'تغيرت حالة الإعلان';
      case 'competitionanalysis': return 'تحليل المنافسة';
      case 'competitionreport': return 'تقرير المنافسة';
      case 'newcompetitor': return 'منافس جديد';
      case 'cheapercompetitor': return 'منافس أرخص';
      case 'performancealert': return 'تنبيه الأداء';
      case 'performanceimprovement': return 'تحسن الأداء';
      case 'weeklysummary': return 'ملخص أسبوعي';
      case 'dailyreport': return 'تقرير يومي';
      case 'abtesting': return 'اختبار A/B';
      case 'marketinsights': return 'رؤى السوق';
      case 'smartrecommendation': return 'توصية ذكية';
      case 'trendingcategory': return 'فئة رائجة';
      case 'newmessage': return 'رسالة جديدة';
      case 'contactrequest': return 'طلب اتصال';
      case 'messagereaction': return 'تفاعل مع الرسالة';
      case 'security': return 'أمان';
      case 'accountsecurity': return 'أمان الحساب';
      case 'passwordchanged': return 'تم تغيير كلمة المرور';
      case 'emailverification': return 'التحقق من البريد الإلكتروني';
      case 'payment': return 'دفع';
      case 'subscriptionexpiring': return 'انتهاء الاشتراك';
      case 'subscriptionrenewed': return 'تجديد الاشتراك';
      case 'subscriptioncancelled': return 'إلغاء الاشتراك';
      case 'systemmaintenance': return 'صيانة النظام';
      case 'systemupdate': return 'تحديث النظام';
      case 'featureannouncement': return 'إعلان ميزة جديدة';
      case 'general': return 'عام';
      case 'broadcast': return 'بث';
      case 'group': return 'مجموعة';
      case 'urgent': return 'عاجل';
      case 'highpriority': return 'أولوية عالية';
      default: return type;
    }
  }

  getCategoryText(category: string): string {
    switch (category.toLowerCase()) {
      case 'ad': return 'إعلانات';
      case 'chat': return 'دردشة';
      case 'system': return 'نظام';
      case 'security': return 'أمان';
      case 'payment': return 'دفع';
      case 'analysis': return 'تحليل';
      case 'performance': return 'أداء';
      case 'competition': return 'منافسة';
      case 'insights': return 'رؤى';
      case 'recommendation': return 'توصيات';
      case 'trends': return 'اتجاهات';
      case 'contact': return 'اتصال';
      case 'subscription': return 'اشتراك';
      case 'general': return 'عام';
      case 'group': return 'مجموعة';
      default: return category;
    }
  }
}
