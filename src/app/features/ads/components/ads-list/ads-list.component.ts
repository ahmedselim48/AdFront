import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdsService } from '../../ads.service';
import { AdItem, AdSearchRequest, PaginatedAdsResponse } from '../../../../models/ads.models';
import { CategoryService } from '../../../../core/services/category.service';
import { ContactHelperService } from '../../../../core/services/contact-helper.service';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-ads-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ads-list.component.html',
  styleUrls: ['./ads-list.component.scss']
})
export class AdsListComponent implements OnInit, OnDestroy {
  ads: AdItem[] = [];
  categories: any[] = [];
  paginatedResponse: PaginatedAdsResponse | null = null;
  loading = false;
  searchForm!: FormGroup;
  currentPage = 1;
  pageSize = 12;
  totalPages = 0;
  searchRequest: AdSearchRequest = {};
  
  // User role check
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    console.log('Current user:', user);
    console.log('User roles:', user?.roles);
    
    if (!user) {
      // Fallback: check localStorage for user data
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Stored user:', parsedUser);
          const isAdmin = parsedUser.roles?.includes('Admin') || parsedUser.roles?.includes('admin') || false;
          console.log('isAdmin from stored user:', isAdmin);
          return isAdmin;
        } catch (e) {
          console.log('Error parsing stored user:', e);
        }
      }
      console.log('No user found, not admin');
      return false;
    }
    
    const isAdmin = user.roles?.includes('Admin') || user.roles?.includes('admin') || false;
    console.log('isAdmin result:', isAdmin);
    return isAdmin;
  }
  
  private destroy$ = new Subject<void>();
  private adsService = inject(AdsService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private contactHelper = inject(ContactHelperService);

  ngOnInit() {
    this.initializeSearchForm();
    this.loadCategories();
    this.loadAds();
    this.setupSearchSubscription();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchForm() {
    this.searchForm = this.fb.group({
      query: [''],
      categoryId: [null],
      minPrice: [null],
      maxPrice: [null],
      location: [''],
      status: [null],
      sortBy: ['date'],
      sortOrder: ['desc']
    });
  }

  private setupSearchSubscription() {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.search();
      });
  }

  loadAds() {
    console.log('Loading ads...');
    this.loading = true;
    this.adsService.list(this.currentPage, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Ads loaded successfully:', response);
        this.paginatedResponse = response;
        this.ads = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
        console.log('Ads array:', this.ads);
      },
      error: (error) => {
        console.error('Error loading ads:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    console.log('Loading categories...');
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categories: any[]) => {
        console.log('Categories loaded:', categories);
        this.categories = categories || [];
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.categories = []; // Set empty array on error to prevent template errors
      }
    });
  }

  search() {
    this.searchRequest = this.searchForm.value;
    this.currentPage = 1;
    this.performSearch();
  }

  performSearch() {
    this.loading = true;
    this.searchRequest.page = this.currentPage;
    this.searchRequest.pageSize = this.pageSize;
    
    this.adsService.search(this.searchRequest).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        this.paginatedResponse = response;
        this.ads = response.data;
        this.totalPages = response.totalPages;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error searching ads:', error);
        this.loading = false;
      }
    });
  }

  clearSearch() {
    this.searchForm.reset();
    this.searchRequest = {};
    this.currentPage = 1;
    this.loadAds();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    if (Object.keys(this.searchRequest).length > 0) {
      this.performSearch();
    } else {
      this.loadAds();
    }
  }

  viewAd(ad: AdItem) {
    this.router.navigate(['/ads', ad.id]);
  }

  likeAd(ad: AdItem) {
    this.adsService.like(ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        ad.likesCount++;
      },
      error: (error) => {
        console.error('Error liking ad:', error);
      }
    });
  }

  unlikeAd(ad: AdItem) {
    this.adsService.unlike(ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        ad.likesCount--;
      },
      error: (error) => {
        console.error('Error unliking ad:', error);
      }
    });
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'Draft': 'status-draft',
      'Pending': 'status-pending',
      'Published': 'status-published',
      'Rejected': 'status-rejected',
      'Archived': 'status-archived'
    };
    return statusClasses[status] || 'status-default';
  }

  getStatusText(status: string): string {
    const statusTexts: { [key: string]: string } = {
      'Draft': 'مسودة',
      'Pending': 'في الانتظار',
      'Published': 'منشور',
      'Rejected': 'مرفوض',
      'Archived': 'مؤرشف'
    };
    return statusTexts[status] || status;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) return 'غير محدد';
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  }

  getImageUrl(ad: AdItem): string {
    if (ad.images && ad.images.length > 0) {
      const imageUrl = ad.images[0];
      // Check if it's already a full URL
      if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
      }
      // If it's a relative path, construct the full URL
      if (imageUrl.startsWith('/')) {
        return `http://localhost:5254${imageUrl}`;
      }
      // If it's just a filename, construct the full path
      return `http://localhost:5254/uploads/${imageUrl}`;
    }
    return '/assets/images/placeholder-ad.svg';
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // Contact methods
  openWhatsApp(ad: AdItem): void {
    if (!ad.contactNumber) {
      console.error('Contact number not available');
      return;
    }
    
    this.contactHelper.openContact('WhatsApp', ad.contactNumber, ad.title);
  }

  makeCall(ad: AdItem): void {
    if (!ad.contactNumber) {
      console.error('Contact number not available');
      return;
    }
    
    this.contactHelper.openContact('Call', ad.contactNumber);
  }
}