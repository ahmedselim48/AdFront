import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService, PaginatedUsersResponse, AdminUserDto, BlockUserRequestDto, GeneralResponse } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatCheckboxModule,
    MatTooltipModule,
    MatBadgeModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  loading = false;
  searchForm: FormGroup;
  dataSource = new MatTableDataSource<AdminUserDto>();
  displayedColumns: string[] = [
    'select',
    'name',
    'email',
    'subscription',
    'role',
    'status',
    'actions'
  ];

  totalUsers = 0;
  pageSize = 20;
  currentPage = 1;
  searchTerm = '';
  selectedUsers: Set<string> = new Set();
  selectedStatus = 'all';
  
  // Statistics
  activeUsersCount = 0;
  blockedUsersCount = 0;
  newUsersCount = 0;
  
  // UI State
  showUserDetails = false;
  selectedUser: AdminUserDto | null = null;
  selectedUserForActions: AdminUserDto | null = null;

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: ['']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearch();
    this.calculateStatistics();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSearch(): void {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 1;
        this.loadUsers();
      });
  }

  loadUsers(): void {
    this.loading = true;
    const formValue = this.searchForm.value;
    
    this.adminService.getUsers(
      this.currentPage,
      this.pageSize,
      formValue.searchTerm || undefined
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: GeneralResponse<PaginatedUsersResponse>) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data.users;
          this.totalUsers = response.data.totalCount;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.calculateStatistics();
          // Load subscription data for all users
          this.loadSubscriptionsForAllUsers();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.snackBar.open('خطأ في تحميل المستخدمين', 'إغلاق', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadUsers();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadUsers();
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: ''
    });
    this.currentPage = 1;
    this.loadUsers();
  }

  selectUser(userId: string): void {
    if (this.selectedUsers.has(userId)) {
      this.selectedUsers.delete(userId);
    } else {
      this.selectedUsers.add(userId);
    }
  }

  selectAllUsers(): void {
    if (this.selectedUsers.size === this.dataSource.data.length) {
      this.selectedUsers.clear();
    } else {
      this.dataSource.data.forEach(user => {
        this.selectedUsers.add(user.id);
      });
    }
  }

  isAllSelected(): boolean {
    return this.selectedUsers.size === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  isIndeterminate(): boolean {
    return this.selectedUsers.size > 0 && this.selectedUsers.size < this.dataSource.data.length;
  }

  banUser(userId: string, duration: '7days' | 'permanent'): void {
    const reason = prompt('سبب الحظر (اختياري):');
    
    const banRequest = duration === '7days' 
      ? this.adminService.banUser7Days(userId, reason || undefined)
      : this.adminService.banUserPermanent(userId, reason || undefined);

    banRequest.pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response) => {
        if (response.success) {
          this.snackBar.open('تم حظر المستخدم بنجاح', 'إغلاق', { duration: 3000 });
          this.loadUsers();
        } else {
          this.snackBar.open('خطأ في حظر المستخدم', 'إغلاق', { duration: 3000 });
        }
      },
      error: (error) => {
        console.error('Error banning user:', error);
        this.snackBar.open('خطأ في حظر المستخدم', 'إغلاق', { duration: 3000 });
      }
    });
  }

  unbanUser(userId: string): void {
    this.adminService.unbanUser(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('تم إلغاء حظر المستخدم بنجاح', 'إغلاق', { duration: 3000 });
            this.loadUsers();
          } else {
            this.snackBar.open('خطأ في إلغاء حظر المستخدم', 'إغلاق', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error unbanning user:', error);
          this.snackBar.open('خطأ في إلغاء حظر المستخدم', 'إغلاق', { duration: 3000 });
        }
      });
  }

  deleteUser(userId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      this.adminService.deleteUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('تم حذف المستخدم بنجاح', 'إغلاق', { duration: 3000 });
              this.loadUsers();
            } else {
              this.snackBar.open('خطأ في حذف المستخدم', 'إغلاق', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting user:', error);
            this.snackBar.open('خطأ في حذف المستخدم', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  bulkAction(action: string): void {
    if (this.selectedUsers.size === 0) {
      this.snackBar.open('يرجى اختيار مستخدم واحد على الأقل', 'إغلاق', { duration: 3000 });
      return;
    }

    const userIds = Array.from(this.selectedUsers);
    
    switch (action) {
      case 'ban7days':
        this.bulkBanUsers(userIds, '7days');
        break;
      case 'banpermanent':
        this.bulkBanUsers(userIds, 'permanent');
        break;
      case 'unban':
        this.bulkUnbanUsers(userIds);
        break;
      case 'delete':
        this.bulkDeleteUsers(userIds);
        break;
    }
  }

  private bulkBanUsers(userIds: string[], duration: '7days' | 'permanent'): void {
    const reason = prompt('سبب الحظر (اختياري):');
    
    userIds.forEach(userId => {
      const banRequest = duration === '7days' 
        ? this.adminService.banUser7Days(userId, reason || undefined)
        : this.adminService.banUserPermanent(userId, reason || undefined);

      banRequest.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open(`تم حظر ${userIds.length} مستخدم بنجاح`, 'إغلاق', { duration: 3000 });
            this.loadUsers();
            this.selectedUsers.clear();
          }
        },
        error: (error) => {
          console.error('Error bulk banning users:', error);
          this.snackBar.open('خطأ في حظر المستخدمين', 'إغلاق', { duration: 3000 });
        }
      });
    });
  }

  private bulkUnbanUsers(userIds: string[]): void {
    userIds.forEach(userId => {
      this.adminService.unbanUser(userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open(`تم إلغاء حظر ${userIds.length} مستخدم بنجاح`, 'إغلاق', { duration: 3000 });
              this.loadUsers();
              this.selectedUsers.clear();
            }
          },
          error: (error) => {
            console.error('Error bulk unbanning users:', error);
            this.snackBar.open('خطأ في إلغاء حظر المستخدمين', 'إغلاق', { duration: 3000 });
          }
        });
    });
  }

  private bulkDeleteUsers(userIds: string[]): void {
    if (confirm(`هل أنت متأكد من حذف ${userIds.length} مستخدم؟`)) {
      userIds.forEach(userId => {
        this.adminService.deleteUser(userId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open(`تم حذف ${userIds.length} مستخدم بنجاح`, 'إغلاق', { duration: 3000 });
                this.loadUsers();
                this.selectedUsers.clear();
              }
            },
            error: (error) => {
              console.error('Error bulk deleting users:', error);
              this.snackBar.open('خطأ في حذف المستخدمين', 'إغلاق', { duration: 3000 });
            }
          });
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'primary';
      case 'blocked':
        return 'warn';
      case 'pending':
        return 'accent';
      default:
        return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'active':
        return 'نشط';
      case 'blocked':
        return 'محظور';
      case 'pending':
        return 'في الانتظار';
      default:
        return status;
    }
  }

  getRoleLabel(user: AdminUserDto): string {
    // Check if user is admin based on email
    if (this.isAdminUser(user)) {
      return 'مسؤول';
    }
    return 'مستخدم';
  }

  isAdminUser(user: AdminUserDto): boolean {
    // Check if email contains 'admin' (case insensitive)
    return user.email.toLowerCase().includes('admin');
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }

  getDisplayName(user: AdminUserDto): string {
    if (user.fullName) {
      return user.fullName;
    }
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return 'غير محدد';
  }

  // New UI Functions

  viewUserDetails(user: AdminUserDto): void {
    this.selectedUser = user;
    this.showUserDetails = true;
  }

  closeUserDetails(): void {
    this.showUserDetails = false;
    this.selectedUser = null;
  }

  setSelectedUser(user: AdminUserDto): void {
    this.selectedUserForActions = user;
  }

  viewUserSubscription(user: AdminUserDto): void {
    if (!user.subscription) {
      // Load subscription data if not already loaded
      this.loadUserSubscription(user);
    } else {
      this.showSubscriptionDetails(user);
    }
  }

  private loadSubscriptionsForAllUsers(): void {
    this.dataSource.data.forEach(user => {
      this.adminService.getUserSubscription(user.id).subscribe({
        next: (subscription) => {
          user.subscription = subscription;
        },
        error: (error) => {
          console.error('Error loading subscription for user:', user.id, error);
          // Set default subscription data if error
          user.subscription = {
            userId: user.id,
            isActive: false,
            endDate: '',
            provider: '',
            amount: 0,
            daysLeft: 0
          };
        }
      });
    });
  }

  private loadUserSubscription(user: AdminUserDto): void {
    this.adminService.getUserSubscription(user.id).subscribe({
      next: (subscription) => {
        user.subscription = subscription;
        this.showSubscriptionDetails(user);
      },
      error: (error) => {
        console.error('Error loading subscription:', error);
        this.snackBar.open('خطأ في تحميل معلومات الاشتراك', 'إغلاق', { duration: 3000 });
      }
    });
  }

  private showSubscriptionDetails(user: AdminUserDto): void {
    // Load subscription data and show in user details modal
    if (!user.subscription) {
      this.loadUserSubscription(user);
    }
    this.viewUserDetails(user);
  }

  editUser(user: AdminUserDto): void {
    // TODO: Implement edit user functionality
    this.snackBar.open('ميزة التعديل قيد التطوير', 'إغلاق', { duration: 3000 });
  }


  exportUsers(): void {
    // TODO: Implement export functionality
    this.snackBar.open('ميزة التصدير قيد التطوير', 'إغلاق', { duration: 3000 });
  }

  calculateStatistics(): void {
    this.activeUsersCount = this.dataSource.data.filter(user => 
      user.status?.toLowerCase() === 'active'
    ).length;
    
    this.blockedUsersCount = this.dataSource.data.filter(user => 
      user.status?.toLowerCase() === 'blocked'
    ).length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    this.newUsersCount = this.dataSource.data.filter(user => {
      const userDate = new Date(user.createdAt);
      return userDate.getMonth() === currentMonth && userDate.getFullYear() === currentYear;
    }).length;
  }
}
