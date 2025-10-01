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
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService, PaginatedAdsResponse, AdminAdDto, GeneralResponse } from '../../../../core/services/admin.service';

@Component({
  selector: 'app-ad-management',
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
    MatTabsModule,
    MatExpansionModule,
    MatSlideToggleModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './ad-management.component.html',
  styleUrls: ['./ad-management.component.scss']
})
export class AdManagementComponent implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  private destroy$ = new Subject<void>();
  
  loading = false;
  searchForm: FormGroup;
  dataSource = new MatTableDataSource<AdminAdDto>();
  displayedColumns: string[] = [
    'select',
    'title',
    'owner',
    'price',
    'status',
    'createdAt',
    'actions'
  ];

  totalAds = 0;
  pageSize = 20;
  currentPage = 1;
  searchTerm = '';
  selectedAds: Set<string> = new Set();
  selectedStatus = 'all';
  selectedTab = 0;
  
  // UI State
  showAdvancedSearch = false;
  showAdDetails = false;
  selectedAd: AdminAdDto | null = null;
  selectedAdForActions: AdminAdDto | null = null;

  // Filter options
  statusOptions = [
    { value: 'all', label: 'جميع الإعلانات' },
    { value: 'Pending', label: 'في الانتظار' },
    { value: 'Approved', label: 'مقبول' },
    { value: 'Rejected', label: 'مرفوض' },
    { value: 'Scheduled', label: 'مجدول' },
    { value: 'Archived', label: 'مؤرشف' }
  ];

  categoryOptions: Array<{ value: string; label: string; }> = [
    { value: 'all', label: 'جميع الفئات' }
  ];

  // Statistics
  stats = {
    totalAds: 0,
    activeAds: 0,
    pendingAds: 0,
    rejectedAds: 0,
    totalViews: 0,
    totalLikes: 0
  };

  constructor(
    private fb: FormBuilder,
    private adminService: AdminService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: ['all'],
      category: ['all'],
      priceFrom: [''],
      priceTo: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  ngOnInit(): void {
    this.loadAds();
    this.loadStats();
    this.loadCategories();
    this.setupSearch();
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
        this.loadAds();
      });
  }

  loadAds(): void {
    this.loading = true;
    const formValue = this.searchForm.value;
    
    this.adminService.getAds(
      this.currentPage,
      this.pageSize,
      formValue.searchTerm || undefined,
      formValue.status !== 'all' ? formValue.status : undefined
    ).pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (response: GeneralResponse<PaginatedAdsResponse>) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data.ads;
          this.totalAds = response.data.totalCount;
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          // Keep stats cards stable: stats come from backend via loadStats()
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ads:', error);
        this.snackBar.open('خطأ في تحميل الإعلانات', 'إغلاق', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.adminService.getStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<any>) => {
          if (response.success && response.data) {
            this.stats = {
              totalAds: response.data.totalAds || 0,
              activeAds: response.data.totalAcceptedAds || response.data.activeAds || 0,
              pendingAds: response.data.totalPendingAds || response.data.pendingAds || 0,
              rejectedAds: response.data.totalRejectedAds || response.data.rejectedAds || 0,
              totalViews: response.data.totalViews || 0,
              totalLikes: response.data.totalLikes || 0
            };
          }
        },
        error: (error) => {
          console.error('Error loading stats:', error);
        }
      });
  }

  filterByStatus(status: 'all' | 'Approved' | 'Pending' | 'Rejected'): void {
    const mapped = status === 'Approved' ? 'Approved'
      : status === 'Pending' ? 'Pending'
      : status === 'Rejected' ? 'Rejected'
      : 'all';
    this.searchForm.patchValue({ status: mapped });
    this.currentPage = 1;
    this.loadAds();
  }

  loadCategories(): void {
    this.adminService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GeneralResponse<any>) => {
          if (response.success && response.data) {
            const backendCategories = response.data as Array<{ id: number; name: string; }>; 
            this.categoryOptions = [
              { value: 'all', label: 'جميع الفئات' },
              ...backendCategories.map(c => ({ value: String(c.id), label: c.name }))
            ];
          }
        },
        error: (error) => {
          console.error('Error loading categories:', error);
        }
      });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.loadAds();
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAds();
  }

  clearSearch(): void {
    this.searchForm.reset({
      searchTerm: '',
      status: 'all',
      category: 'all',
      priceFrom: '',
      priceTo: '',
      dateFrom: '',
      dateTo: ''
    });
    this.currentPage = 1;
    this.loadAds();
  }

  selectAd(adId: string): void {
    if (this.selectedAds.has(adId)) {
      this.selectedAds.delete(adId);
    } else {
      this.selectedAds.add(adId);
    }
  }

  selectAllAds(): void {
    if (this.selectedAds.size === this.dataSource.data.length) {
      this.selectedAds.clear();
    } else {
      this.dataSource.data.forEach(ad => {
        this.selectedAds.add(ad.id);
      });
    }
  }

  isAllSelected(): boolean {
    return this.selectedAds.size === this.dataSource.data.length && this.dataSource.data.length > 0;
  }

  isIndeterminate(): boolean {
    return this.selectedAds.size > 0 && this.selectedAds.size < this.dataSource.data.length;
  }

  acceptAd(adId: string): void {
    this.adminService.acceptAd(adId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('تم قبول الإعلان بنجاح', 'إغلاق', { duration: 3000 });
            this.loadAds();
            this.loadStats();
          } else {
            this.snackBar.open('خطأ في قبول الإعلان', 'إغلاق', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error accepting ad:', error);
          this.snackBar.open('خطأ في قبول الإعلان', 'إغلاق', { duration: 3000 });
        }
      });
  }

  rejectAd(adId: string): void {
    const reason = prompt('سبب الرفض:');
    if (reason) {
      this.adminService.rejectAd(adId, reason)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('تم رفض الإعلان بنجاح', 'إغلاق', { duration: 3000 });
              this.loadAds();
              this.loadStats();
            } else {
              this.snackBar.open('خطأ في رفض الإعلان', 'إغلاق', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error rejecting ad:', error);
            this.snackBar.open('خطأ في رفض الإعلان', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  deleteAd(adId: string): void {
    if (confirm('هل أنت متأكد من حذف هذا الإعلان؟')) {
      this.adminService.deleteAd(adId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('تم حذف الإعلان بنجاح', 'إغلاق', { duration: 3000 });
              this.loadAds();
              this.loadStats();
            } else {
              this.snackBar.open('خطأ في حذف الإعلان', 'إغلاق', { duration: 3000 });
            }
          },
          error: (error) => {
            console.error('Error deleting ad:', error);
            this.snackBar.open('خطأ في حذف الإعلان', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  bulkAction(action: string): void {
    if (this.selectedAds.size === 0) {
      this.snackBar.open('يرجى اختيار إعلان واحد على الأقل', 'إغلاق', { duration: 3000 });
      return;
    }

    const adIds = Array.from(this.selectedAds);
    
    switch (action) {
      case 'accept':
        this.bulkAcceptAds(adIds);
        break;
      case 'reject':
        this.bulkRejectAds(adIds);
        break;
      case 'delete':
        this.bulkDeleteAds(adIds);
        break;
    }
  }

  private bulkAcceptAds(adIds: string[]): void {
    adIds.forEach(adId => {
      this.adminService.acceptAd(adId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open(`تم قبول ${adIds.length} إعلان بنجاح`, 'إغلاق', { duration: 3000 });
              this.loadAds();
              this.loadStats();
              this.selectedAds.clear();
            }
          },
          error: (error) => {
            console.error('Error bulk accepting ads:', error);
            this.snackBar.open('خطأ في قبول الإعلانات', 'إغلاق', { duration: 3000 });
          }
        });
    });
  }

  private bulkRejectAds(adIds: string[]): void {
    const reason = prompt('سبب الرفض:');
    if (reason) {
      adIds.forEach(adId => {
        this.adminService.rejectAd(adId, reason)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open(`تم رفض ${adIds.length} إعلان بنجاح`, 'إغلاق', { duration: 3000 });
                this.loadAds();
                this.loadStats();
                this.selectedAds.clear();
              }
            },
            error: (error) => {
              console.error('Error bulk rejecting ads:', error);
              this.snackBar.open('خطأ في رفض الإعلانات', 'إغلاق', { duration: 3000 });
            }
          });
      });
    }
  }

  private bulkDeleteAds(adIds: string[]): void {
    if (confirm(`هل أنت متأكد من حذف ${adIds.length} إعلان؟`)) {
      adIds.forEach(adId => {
        this.adminService.deleteAd(adId)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open(`تم حذف ${adIds.length} إعلان بنجاح`, 'إغلاق', { duration: 3000 });
                this.loadAds();
                this.loadStats();
                this.selectedAds.clear();
              }
            },
            error: (error) => {
              console.error('Error bulk deleting ads:', error);
              this.snackBar.open('خطأ في حذف الإعلانات', 'إغلاق', { duration: 3000 });
            }
          });
      });
    }
  }


  getImageUrl(images: string[]): string {
    return images && images.length > 0 ? images[0] : '';
  }

  onTabChange(index: number): void {
    this.selectedTab = index;
    this.selectedStatus = this.statusOptions[index].value;
    this.currentPage = 1;
    this.loadAds();
  }

  // New methods similar to user-management
  calculateStatistics(): void {
    const ads = this.dataSource.data;
    this.stats = {
      totalAds: ads.length,
      activeAds: ads.filter(ad => ad.status === 'Approved').length,
      pendingAds: ads.filter(ad => ad.status === 'Pending').length,
      rejectedAds: ads.filter(ad => ad.status === 'Rejected').length,
      totalViews: 0, // Will be calculated from backend
      totalLikes: 0  // Will be calculated from backend
    };
  }

  viewAdDetails(ad: AdminAdDto): void {
    this.selectedAd = ad;
    this.showAdDetails = true;
  }

  closeAdDetails(): void {
    this.showAdDetails = false;
    this.selectedAd = null;
  }

  openActionsMenu(ad: AdminAdDto, event: Event): void {
    event.stopPropagation();
    this.selectedAdForActions = ad;
  }

  closeActionsMenu(): void {
    this.selectedAdForActions = null;
  }

  setPendingAd(adId: string): void {
    this.adminService.setPendingAd(adId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('تم تحويل الحالة إلى الانتظار', 'إغلاق', { duration: 3000 });
            this.loadAds();
            this.loadStats();
          } else {
            this.snackBar.open('خطأ في تحديث الحالة', 'إغلاق', { duration: 3000 });
          }
        },
        error: (error) => {
          console.error('Error setting pending:', error);
          this.snackBar.open('خطأ في تحديث الحالة', 'إغلاق', { duration: 3000 });
        }
      });
  }

  toggleAdvancedSearch(): void {
    this.showAdvancedSearch = !this.showAdvancedSearch;
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'primary';
      case 'pending':
        return 'accent';
      case 'rejected':
        return 'warn';
      case 'scheduled':
        return 'accent';
      case 'archived':
        return 'basic';
      default:
        return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'مقبول';
      case 'pending':
        return 'في الانتظار';
      case 'rejected':
        return 'مرفوض';
      case 'scheduled':
        return 'مجدول';
      case 'archived':
        return 'مؤرشف';
      default:
        return status;
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleDateString('ar-SA');
  }
}
