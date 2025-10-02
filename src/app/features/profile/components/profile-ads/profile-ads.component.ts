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
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LucideAngularModule, Plus, Search, Filter, MoreVertical, Eye, Edit, Trash2, Calendar, DollarSign, MapPin, Tag } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../ads/ads.service';
import { AdItem, AdStatus } from '../../../../models/ads.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-ads',
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
    MatMenuModule,
    MatDividerModule,
    MatDialogModule,
    LucideAngularModule
  ],
  templateUrl: './profile-ads.component.html',
  styleUrls: ['./profile-ads.component.scss']
})
export class ProfileAdsComponent implements OnInit, OnDestroy {
  ads: AdItem[] = [];
  filteredAds: AdItem[] = [];
  isLoading = false;
  isSaving = false;
  
  // Filters
  filterForm!: FormGroup;
  statusFilter: string | null = null;
  searchTerm = '';
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalPages = 1;
  
  // Status options
  statusOptions = [
    { value: null, label: 'جميع الإعلانات' },
    { value: 'Draft', label: 'مسودة' },
    { value: 'Pending', label: 'في الانتظار' },
    { value: 'Published', label: 'منشور' },
    { value: 'Rejected', label: 'مرفوض' },
    { value: 'Expired', label: 'منتهي الصلاحية' }
  ];

  private destroy$ = new Subject<void>();
  private adsService = inject(AdsService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit() {
    this.initializeFilterForm();
    this.loadAds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeFilterForm() {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      status: [null],
      category: [''],
      minPrice: [''],
      maxPrice: ['']
    });

    // Subscribe to form changes
    this.filterForm.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => {
      this.applyFilters();
    });
  }

  loadAds() {
    this.isLoading = true;
    
    this.adsService.getMyAds().pipe(takeUntil(this.destroy$)).subscribe({
      next: (ads: AdItem[]) => {
        this.ads = ads;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading ads:', error);
        this.toastr.error('فشل في تحميل الإعلانات', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  applyFilters() {
    const formValue = this.filterForm.value;
    let filtered = [...this.ads];

    // Search term filter
    if (formValue.searchTerm) {
      const searchLower = formValue.searchTerm.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(searchLower) ||
        (ad.description || '').toLowerCase().includes(searchLower) ||
        (ad.categoryName?.toLowerCase().includes(searchLower) ?? false)
      );
    }

    // Status filter
    if (formValue.status) {
      filtered = filtered.filter(ad => ad.status === formValue.status);
    }

    // Category filter
    if (formValue.category) {
      filtered = filtered.filter(ad => ad.categoryId === formValue.category);
    }

    // Price filters
    if (formValue.minPrice) {
      filtered = filtered.filter(ad => ad.price >= formValue.minPrice);
    }
    if (formValue.maxPrice) {
      filtered = filtered.filter(ad => ad.price <= formValue.maxPrice);
    }

    this.filteredAds = filtered;
    this.updatePagination();
  }

  updatePagination() {
    this.totalPages = Math.ceil(this.filteredAds.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  getPaginatedAds(): AdItem[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredAds.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }

  onStatusFilterChange(status: string | null) {
    this.statusFilter = status;
    this.filterForm.patchValue({ status });
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.filterForm.patchValue({ searchTerm });
  }

  onClearFilters() {
    this.filterForm.reset();
    this.statusFilter = null;
    this.searchTerm = '';
  }

  onCreateAd() {
    this.router.navigate(['/ads/create']);
  }

  onEditAd(ad: AdItem) {
    this.router.navigate(['/ads', ad.id, 'edit']);
  }

  onDeleteAd(ad: AdItem) {
    if (confirm(`هل أنت متأكد من حذف الإعلان "${ad.title}"؟`)) {
      this.isSaving = true;
      
      this.adsService.remove(ad.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.ads = this.ads.filter(a => a.id !== ad.id);
          this.applyFilters();
          this.toastr.success('تم حذف الإعلان بنجاح', 'تم');
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('Error deleting ad:', error);
          this.toastr.error('فشل في حذف الإعلان', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onPublishAd(ad: AdItem) {
    if (ad.status === 'Draft') {
      this.isSaving = true;
      
      this.adsService.publish(ad.id, {}).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedAd: AdItem) => {
          const index = this.ads.findIndex(a => a.id === ad.id);
          if (index !== -1) {
            this.ads[index] = updatedAd;
            this.applyFilters();
          }
          this.toastr.success('تم نشر الإعلان بنجاح', 'تم');
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('Error publishing ad:', error);
          this.toastr.error('فشل في نشر الإعلان', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onViewAd(ad: AdItem) {
    this.router.navigate(['/ads', ad.id]);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Published': return 'primary';
      case 'Draft': return 'accent';
      case 'Pending': return 'warn';
      case 'Rejected': return 'warn';
      case 'Expired': return 'basic';
      default: return 'basic';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'Published': return 'منشور';
      case 'Draft': return 'مسودة';
      case 'Pending': return 'في الانتظار';
      case 'Rejected': return 'مرفوض';
      case 'Expired': return 'منتهي الصلاحية';
      default: return 'غير محدد';
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAdImage(ad: AdItem): string {
    if (ad.images && ad.images.length > 0) {
      return ad.images[0];
    }
    return '/assets/images/placeholder-ad.svg';
  }

  onRefresh() {
    this.loadAds();
    this.toastr.success('تم تحديث الإعلانات', 'تم');
  }

  trackByAdId(index: number, ad: AdItem): string {
    return ad.id;
  }

  getPublishedAdsCount(): number {
    return this.ads.filter(ad => ad.status === 'Published').length;
  }

  getDraftAdsCount(): number {
    return this.ads.filter(ad => ad.status === 'Draft').length;
  }

  getTotalViews(): number {
    return this.ads.reduce((sum, ad) => sum + (ad.viewsCount || 0), 0);
  }

  getTotalClicks(): number {
    return this.ads.reduce((sum, ad) => sum + (ad.clicksCount || 0), 0);
  }

  getTotalLikes(): number {
    return this.ads.reduce((sum, ad) => sum + (ad.likesCount || 0), 0);
  }

  getTotalComments(): number {
    return this.ads.reduce((sum, ad) => sum + (ad.commentsCount || 0), 0);
  }

  getAverageViewsPerAd(): number {
    if (this.ads.length === 0) return 0;
    return Math.round(this.getTotalViews() / this.ads.length);
  }

  getClickThroughRate(): number {
    const totalViews = this.getTotalViews();
    if (totalViews === 0) return 0;
    return Math.round((this.getTotalClicks() / totalViews) * 100 * 100) / 100; // Round to 2 decimal places
  }

  getEngagementRate(): number {
    const totalViews = this.getTotalViews();
    if (totalViews === 0) return 0;
    const totalEngagement = this.getTotalLikes() + this.getTotalComments();
    return Math.round((totalEngagement / totalViews) * 100 * 100) / 100;
  }

  getTopPerformingAd(): AdItem | null {
    if (this.ads.length === 0) return null;
    return this.ads.reduce((top, current) => {
      const currentScore = (current.viewsCount || 0) + (current.likesCount || 0) + (current.commentsCount || 0);
      const topScore = (top.viewsCount || 0) + (top.likesCount || 0) + (top.commentsCount || 0);
      return currentScore > topScore ? current : top;
    });
  }

  getRecentAds(): AdItem[] {
    return [...this.ads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }

  getAdsByStatus(status: string): AdItem[] {
    return this.ads.filter(ad => ad.status === status);
  }

  getAdsByCategory(): { [key: string]: number } {
    const categoryCount: { [key: string]: number } = {};
    this.ads.forEach(ad => {
      const category = ad.categoryName || 'غير محدد';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    return categoryCount;
  }

  getTopCategory(): string {
    const categoryCount = this.getAdsByCategory();
    let topCategory = 'غير محدد';
    let maxCount = 0;
    
    Object.entries(categoryCount).forEach(([category, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topCategory = category;
      }
    });
    
    return topCategory;
  }

  onViewAnalytics(ad: AdItem) {
    this.router.navigate(['/ads', ad.id, 'analytics']);
  }

  onDuplicateAd(ad: AdItem) {
    // Navigate to create page with pre-filled data
    this.router.navigate(['/ads/create'], { 
      queryParams: { 
        duplicate: ad.id,
        title: ad.title,
        description: ad.description,
        price: ad.price,
        location: ad.location,
        categoryId: ad.categoryId
      }
    });
  }

  onArchiveAd(ad: AdItem) {
    if (confirm(`هل أنت متأكد من أرشفة الإعلان "${ad.title}"؟`)) {
      this.isSaving = true;
      
      this.adsService.update(ad.id, { status: 'Archived' }).pipe(takeUntil(this.destroy$)).subscribe({
        next: (updatedAd: AdItem) => {
          const index = this.ads.findIndex(a => a.id === ad.id);
          if (index !== -1) {
            this.ads[index] = updatedAd;
            this.applyFilters();
          }
          this.toastr.success('تم أرشفة الإعلان بنجاح', 'تم');
          this.isSaving = false;
        },
        error: (error: any) => {
          console.error('Error archiving ad:', error);
          this.toastr.error('فشل في أرشفة الإعلان', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onUnarchiveAd(ad: AdItem) {
    this.isSaving = true;
    
    this.adsService.update(ad.id, { status: 'Draft' }).pipe(takeUntil(this.destroy$)).subscribe({
      next: (updatedAd: AdItem) => {
        const index = this.ads.findIndex(a => a.id === ad.id);
        if (index !== -1) {
          this.ads[index] = updatedAd;
          this.applyFilters();
        }
        this.toastr.success('تم إلغاء أرشفة الإعلان بنجاح', 'تم');
        this.isSaving = false;
      },
      error: (error: any) => {
        console.error('Error unarchiving ad:', error);
        this.toastr.error('فشل في إلغاء أرشفة الإعلان', 'خطأ');
        this.isSaving = false;
      }
    });
  }
}
