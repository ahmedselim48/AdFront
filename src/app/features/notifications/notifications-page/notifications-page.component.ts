import { Component, OnInit, OnDestroy, ViewChild, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatRadioModule } from '@angular/material/radio';
import { MatListModule } from '@angular/material/list';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
// import { MatChipListboxModule } from '@angular/material/chips'; // Not available in this version
import { MatNativeDateModule } from '@angular/material/core';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationService } from '../../../core/services/notification.service';
import { 
  NotificationDto, 
  NotificationFilterDto, 
  NotificationListResponseDto,
  NotificationStatsDto,
  NotificationType,
  NotificationCategory,
  NotificationPriority,
  BulkNotificationActionDto
} from '../../../models/notification.model';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatDialogModule,
    MatSnackBarModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatCheckboxModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatTooltipModule,
    MatMenuModule,
    MatBadgeModule,
    MatTabsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatSliderModule,
    MatRadioModule,
    MatListModule,
    MatStepperModule,
    MatTreeModule,
    MatAutocompleteModule,
    MatButtonToggleModule,
    // MatChipListboxModule, // Not available in this version
    MatNativeDateModule,
    LucideAngularModule
  ],
  templateUrl: './notifications-page.component.html',
  styleUrls: ['./notifications-page.component.scss']
})
export class NotificationsPageComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Data
  notifications: NotificationDto[] = [];
  dataSource = new MatTableDataSource<NotificationDto>([]);
  stats: NotificationStatsDto | null = null;
  
  // Pagination
  totalCount = 0;
  pageSize = 20;
  currentPage = 0;
  pageSizeOptions = [10, 20, 50, 100];
  
  // Filters
  filterForm: FormGroup;
  showAdvancedFilters = false;
  
  // Selection
  selectedNotifications = new Set<string>();
  selectAll = false;
  
  // Loading states
  isLoading = false;
  isFiltering = false;
  isBulkActionLoading = false;
  
  // Math property for template
  Math = Math;
  
  // Filter options
  notificationTypes: { value: NotificationType; label: string }[] = [
    { value: 'AdPublished', label: 'نشر إعلان' },
    { value: 'AdExpired', label: 'انتهاء إعلان' },
    { value: 'NewMessage', label: 'رسالة جديدة' },
    { value: 'ContactRequest', label: 'طلب تواصل' },
    { value: 'CheaperCompetitor', label: 'منافس بسعر أقل' },
    { value: 'CompetitionReport', label: 'تقرير منافسة' },
    { value: 'AccountSecurity', label: 'تسجيل دخول مشبوه' },
    { value: 'Payment', label: 'دفع' },
    { value: 'SubscriptionExpiring', label: 'انتهاء اشتراك' },
    { value: 'WeeklySummary', label: 'ملخص أسبوعي' }
  ];

  categories: { value: NotificationCategory; label: string }[] = [
    { value: 'Ad', label: 'الإعلانات' },
    { value: 'Chat', label: 'الدردشة' },
    { value: 'System', label: 'النظام' },
    { value: 'Security', label: 'الأمان' },
    { value: 'Payment', label: 'المدفوعات' },
    { value: 'Performance', label: 'الأداء' },
    { value: 'Competition', label: 'المنافسة' },
    { value: 'Analysis', label: 'التحليل' }
  ];

  priorities: { value: NotificationPriority; label: string }[] = [
    { value: 'Low', label: 'منخفضة' },
    { value: 'Medium', label: 'متوسطة' },
    { value: 'High', label: 'عالية' },
    { value: 'Urgent', label: 'عاجلة' }
  ];

  readStatusOptions = [
    { value: true, label: 'مقروء' },
    { value: false, label: 'غير مقروء' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.filterForm = this.createFilterForm();
  }

  ngOnInit(): void {
    this.setupFormSubscriptions();
    this.loadNotifications();
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFilterForm(): FormGroup {
    return this.fb.group({
      search: [''],
      type: [''],
      category: [''],
      priority: [''],
      isRead: [''],
      fromDate: [''],
      toDate: ['']
    });
  }

  private setupFormSubscriptions(): void {
    // Search with debounce
    this.filterForm.get('search')?.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0;
        this.loadNotifications();
      });

    // Other filters
    this.filterForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.currentPage = 0;
        this.loadNotifications();
      });
  }

  /**
   * Load notifications with current filters
   */
  loadNotifications(): void {
    this.isLoading = true;
    this.isFiltering = true;

    const filters: NotificationFilterDto = {
      page: this.currentPage + 1,
      pageSize: this.pageSize,
      ...this.filterForm.value
    };

    // Remove empty values
    Object.keys(filters).forEach(key => {
      if (filters[key as keyof NotificationFilterDto] === '' || 
          filters[key as keyof NotificationFilterDto] === null) {
        delete filters[key as keyof NotificationFilterDto];
      }
    });

    this.notificationService.getAll(filters).subscribe({
      next: (response: NotificationListResponseDto) => {
        console.log('Notifications response:', response);
        this.notifications = response.notifications || [];
        this.dataSource.data = response.notifications || [];
        this.totalCount = response.totalCount || 0;
        console.log('Loaded notifications:', this.notifications);
        console.log('Total count:', this.totalCount);
        this.isLoading = false;
        this.isFiltering = false;
        this.clearSelection();
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
        this.isFiltering = false;
        this.snackBar.open('حدث خطأ في تحميل الإشعارات', 'إغلاق', {
          duration: 5000,
          direction: 'rtl'
        });
      }
    });
  }

  /**
   * Load notification statistics
   */
  loadStats(): void {
    this.notificationService.getStats().subscribe({
      next: (stats) => {
        console.log('Stats response:', stats);
        this.stats = stats;
      },
      error: (error) => {
        console.error('Error loading stats:', error);
      }
    });
  }

  /**
   * Handle page change
   */
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadNotifications();
  }

  /**
   * Toggle advanced filters
   */
  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  /**
   * Clear all filters
   */
  clearFilters(): void {
    this.filterForm.reset();
    this.currentPage = 0;
    this.loadNotifications();
  }

  /**
   * Apply filters
   */
  applyFilters(): void {
    this.currentPage = 0;
    this.loadNotifications();
  }

  /**
   * Handle notification click
   */
  onNotificationClick(notification: NotificationDto): void {
    // Mark as read if not already read
    if (!notification.isRead) {
      this.notificationService.markAsRead(notification.id).subscribe({
        next: () => {
          // Update local state
          notification.isRead = true;
          notification.readAt = new Date();
          this.dataSource.data = [...this.dataSource.data];
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
   * Handle notification selection
   */
  onNotificationSelect(notification: NotificationDto, event: any): void {
    if (event.checked) {
      this.selectedNotifications.add(notification.id);
    } else {
      this.selectedNotifications.delete(notification.id);
    }
    this.updateSelectAllState();
  }

  /**
   * Handle select all
   */
  onSelectAll(event: any): void {
    if (event.checked) {
      this.notifications.forEach(notification => {
        this.selectedNotifications.add(notification.id);
      });
    } else {
      this.selectedNotifications.clear();
    }
    this.selectAll = event.checked;
  }

  /**
   * Update select all state
   */
  private updateSelectAllState(): void {
    this.selectAll = this.notifications && 
                     this.selectedNotifications.size === this.notifications.length && 
                     this.notifications.length > 0;
  }

  /**
   * Clear selection
   */
  private clearSelection(): void {
    this.selectedNotifications.clear();
    this.selectAll = false;
  }

  /**
   * Mark selected as read
   */
  markSelectedAsRead(): void {
    if (this.selectedNotifications.size === 0) return;

    this.isBulkActionLoading = true;
    const selectedIds = Array.from(this.selectedNotifications);

    this.notificationService.markMultipleAsRead(selectedIds).subscribe({
      next: () => {
        // Update local state
        this.notifications.forEach(notification => {
          if (selectedIds.includes(notification.id)) {
            notification.isRead = true;
            notification.readAt = new Date();
          }
        });
        this.dataSource.data = [...this.dataSource.data];
        this.clearSelection();
        this.isBulkActionLoading = false;
        this.snackBar.open('تم تعيين الإشعارات المحددة كمقروءة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl'
        });
      },
      error: (error) => {
        console.error('Error marking notifications as read:', error);
        this.isBulkActionLoading = false;
        this.snackBar.open('حدث خطأ في تعيين الإشعارات كمقروءة', 'إغلاق', {
          duration: 5000,
          direction: 'rtl'
        });
      }
    });
  }

  /**
   * Delete selected notifications
   */
  deleteSelected(): void {
    if (this.selectedNotifications.size === 0) return;

    const selectedIds = Array.from(this.selectedNotifications);
    const selectedCount = selectedIds.length;

    // Show confirmation dialog
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'تأكيد الحذف',
        message: `هل أنت متأكد من حذف ${selectedCount} إشعار؟`,
        confirmText: 'حذف',
        cancelText: 'إلغاء'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        this.isBulkActionLoading = true;

        this.notificationService.deleteMultiple(selectedIds).subscribe({
          next: () => {
            // Remove from local state
            this.notifications = this.notifications.filter(
              notification => !selectedIds.includes(notification.id)
            );
            this.dataSource.data = [...this.notifications];
            this.totalCount -= selectedCount;
            this.clearSelection();
            this.isBulkActionLoading = false;
            this.snackBar.open('تم حذف الإشعارات المحددة', 'إغلاق', {
              duration: 3000,
              direction: 'rtl'
            });
          },
          error: (error) => {
            console.error('Error deleting notifications:', error);
            this.isBulkActionLoading = false;
            this.snackBar.open('حدث خطأ في حذف الإشعارات', 'إغلاق', {
              duration: 5000,
              direction: 'rtl'
            });
          }
        });
      }
    });
  }

  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.isBulkActionLoading = true;

    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        // Update local state
        this.notifications.forEach(notification => {
          notification.isRead = true;
          notification.readAt = new Date();
        });
        this.dataSource.data = [...this.notifications];
        this.isBulkActionLoading = false;
        this.snackBar.open('تم تعيين جميع الإشعارات كمقروءة', 'إغلاق', {
          duration: 3000,
          direction: 'rtl'
        });
      },
      error: (error) => {
        console.error('Error marking all notifications as read:', error);
        this.isBulkActionLoading = false;
        this.snackBar.open('حدث خطأ في تعيين الإشعارات كمقروءة', 'إغلاق', {
          duration: 5000,
          direction: 'rtl'
        });
      }
    });
  }

  /**
   * Get notification icon
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
   * Track by function for ngFor
   */
  trackByNotificationId(index: number, notification: NotificationDto): string {
    return notification.id;
  }

  /**
   * Get selected count
   */
  getSelectedCount(): number {
    return this.selectedNotifications.size;
  }

  /**
   * Check if any notifications are selected
   */
  hasSelectedNotifications(): boolean {
    return this.selectedNotifications.size > 0;
  }

  /**
   * Check if all notifications are read
   */
  areAllNotificationsRead(): boolean {
    return (this.notifications && this.notifications.length > 0) && this.notifications.every(n => n.isRead);
  }

  /**
   * Get priority text in Arabic
   */
  getPriorityText(priority: NotificationPriority): string {
    switch (priority) {
      case 'Urgent': return 'عاجل';
      case 'High': return 'عالي';
      case 'Medium': return 'متوسط';
      case 'Low': return 'منخفض';
      default: return 'عادي';
    }
  }

  /**
   * Get category class
   */
  getCategoryClass(category: string): string {
    switch (category) {
      case 'Ad': return 'category-ad';
      case 'Chat': return 'category-chat';
      case 'System': return 'category-system';
      case 'Security': return 'category-security';
      case 'Payment': return 'category-payment';
      case 'Performance': return 'category-performance';
      case 'Competition': return 'category-competition';
      case 'Analysis': return 'category-analysis';
      default: return 'category-default';
    }
  }

  /**
   * Get category text in Arabic
   */
  getCategoryText(category: string): string {
    switch (category) {
      case 'Ad': return 'إعلان';
      case 'Chat': return 'دردشة';
      case 'System': return 'نظام';
      case 'Security': return 'أمان';
      case 'Payment': return 'دفع';
      case 'Performance': return 'أداء';
      case 'Competition': return 'منافسة';
      case 'Analysis': return 'تحليل';
      default: return 'عام';
    }
  }

  /**
   * Get action icon
   */
  getActionIcon(actionType: string): string {
    switch (actionType) {
      case 'View': return 'visibility';
      case 'Edit': return 'edit';
      case 'Delete': return 'delete';
      case 'Reply': return 'reply';
      case 'Accept': return 'check';
      case 'Decline': return 'close';
      default: return 'arrow_forward';
    }
  }
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <h2 mat-dialog-title>{{ data.title }}</h2>
    <mat-dialog-content>{{ data.message }}</mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button [mat-dialog-close]="false">{{ data.cancelText }}</button>
      <button mat-button [mat-dialog-close]="true" color="warn">{{ data.confirmText }}</button>
    </mat-dialog-actions>
  `
})
export class ConfirmDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {}
}
