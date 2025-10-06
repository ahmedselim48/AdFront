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
  allAds: AdItem[] = []; // Store all ads for client-side filtering
  filteredAds: AdItem[] = []; // Store filtered ads
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
    this.setupSearchSubscription();
    
    // Load ads initially (will trigger search with empty filters)
    this.search();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchForm() {
    this.searchForm = this.fb.group({
      query: [''],
      categoryId: [null],
      dateFilter: ['']
    });
  }

  private setupSearchSubscription() {
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe((formValue) => {
        // Always search, even with empty filters (will show all ads)
        this.search();
      });
  }

  private loadAllAds() {
    this.searchRequest = {
      status: 'Active', // Use Active instead of Published
      page: 1,
      pageSize: this.pageSize
    };
    this.currentPage = 1;
    
    // Try search first, fallback to direct load if it fails
    this.performSearch();
  }

  loadAds() {
    console.log('Loading ads...');
    this.loading = true;
    this.adsService.list(this.currentPage, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Ads loaded successfully:', response);
        this.paginatedResponse = response;
        this.ads = response.data || [];
        this.totalPages = response.totalPages || 0;
        this.loading = false;
        console.log('Ads array:', this.ads);
        console.log(`Found ${this.ads.length} ads`);
      },
      error: (error) => {
        console.error('Error loading ads:', error);
        this.ads = [];
        this.totalPages = 0;
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
    const formValue = this.searchForm.value;
    
    // Use the same approach as admin panel
    this.loading = true;
    this.currentPage = 1;
    
    // Build search parameters similar to admin panel
    const searchTerm = formValue.query || undefined;
    const categoryId = formValue.categoryId || undefined;
    const dateFilter = formValue.dateFilter;
    
    console.log('Search parameters:', { searchTerm, categoryId, dateFilter });
    
    // If we don't have all ads yet, load them first
    if (this.allAds.length === 0) {
      // Load all ads (use a large page size to get all ads)
      this.adsService.list(1, 1000).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          console.log('Initial load response:', response);
          this.allAds = response.data || [];
          console.log(`Loaded ${this.allAds.length} ads for filtering`);
          this.applyFilters();
        },
        error: (error) => {
          console.error('Initial load error:', error);
          this.ads = [];
          this.totalPages = 0;
          this.loading = false;
        }
      });
    } else {
      // Apply filters to existing ads
      this.applyFilters();
    }
  }

  private applyFilters() {
    const formValue = this.searchForm.value;
    const searchTerm = formValue.query || undefined;
    const categoryId = formValue.categoryId || undefined;
    const dateFilter = formValue.dateFilter;
    
    console.log('Applying filters:', { searchTerm, categoryId, dateFilter });
    console.log('Total ads before filtering:', this.allAds.length);
    
    // Apply client-side filtering similar to admin panel
    let filteredAds = [...this.allAds];
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredAds = filteredAds.filter(ad => 
        ad.title.toLowerCase().includes(term) ||
        ad.description?.toLowerCase().includes(term) ||
        ad.categoryName?.toLowerCase().includes(term)
      );
      console.log(`After search filter (${term}): ${filteredAds.length} ads`);
    }
    
    if (categoryId) {
      const categoryIdNum = parseInt(categoryId, 10);
      console.log('Filtering by category ID:', { categoryId, categoryIdNum });
      filteredAds = filteredAds.filter(ad => {
        const matches = ad.categoryId === categoryIdNum;
        console.log(`Ad ${ad.id}: categoryId=${ad.categoryId} (${typeof ad.categoryId}), filter=${categoryIdNum} (${typeof categoryIdNum}), matches=${matches}`);
        return matches;
      });
      console.log(`After category filter: ${filteredAds.length} ads`);
    }
    
    if (dateFilter) {
      const now = new Date();
      let startDate: Date;
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      console.log('Filtering by date:', { 
        dateFilter, 
        now: now.toISOString(), 
        startDate: startDate.toISOString() 
      });
      
      filteredAds = filteredAds.filter(ad => {
        const adDate = new Date(ad.createdAt);
        const matches = adDate >= startDate;
        console.log(`Ad ${ad.id}: createdAt=${ad.createdAt}, adDate=${adDate.toISOString()}, startDate=${startDate.toISOString()}, matches=${matches}`);
        return matches;
      });
      console.log(`After date filter: ${filteredAds.length} ads`);
    }
    
    this.filteredAds = filteredAds;
    this.totalPages = Math.ceil(filteredAds.length / this.pageSize);
    this.loading = false;
    
    console.log(`Found ${filteredAds.length} ads after filtering`);
    
           // Apply pagination
           const startIndex = (this.currentPage - 1) * this.pageSize;
           const endIndex = startIndex + this.pageSize;
           this.ads = filteredAds.slice(startIndex, endIndex);
           
           
        
           
           console.log(`Showing ${this.ads.length} ads on page ${this.currentPage} (${startIndex}-${endIndex})`);
  }

  private buildDateFilter(dateFilter: string) {
    if (!dateFilter) return {};
    
    const now = new Date();
    let startDate: Date;
    
    switch (dateFilter) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        return {};
    }
    
    return {
      createdFrom: startDate,
      createdTo: now
    };
  }

  performSearch() {
    this.loading = true;
    
    // Ensure page and pageSize are set
    this.searchRequest.page = this.searchRequest.page || this.currentPage;
    this.searchRequest.pageSize = this.searchRequest.pageSize || this.pageSize;
    
    console.log('Performing search with request:', this.searchRequest);
    console.log('Search URL will be:', this.buildSearchUrl());
    
    this.adsService.search(this.searchRequest).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Search response:', response);
        this.paginatedResponse = response;
        this.ads = response.data || [];
        this.totalPages = response.totalPages || 0;
        this.loading = false;
        
        console.log(`Found ${this.ads.length} ads out of ${response.totalCount || 0} total`);
        
        // If no active ads found, try loading all ads
        if (this.ads.length === 0 && this.searchRequest.status === 'Active') {
          console.log('No active ads found, trying to load all ads...');
          this.loadAllAdsWithoutStatus();
        }
      },
      error: (error) => {
        console.error('Error searching ads:', error);
        console.error('Error details:', error.error);
        
        // If error with Active status, try without status filter
        if (this.searchRequest.status === 'Active') {
          console.log('Error with Active status, trying without status filter...');
          this.loadAllAdsWithoutStatus();
        } else {
          // If all else fails, use fallback method
          console.log('All search methods failed, using fallback...');
          this.loadAdsFallback();
        }
      }
    });
  }

  private loadAllAdsWithoutStatus() {
    this.searchRequest = {
      page: 1,
      pageSize: this.pageSize
    };
    this.currentPage = 1;
    
    // Try search first, fallback to direct load if it fails
    this.performSearch();
  }

  // Fallback method to load ads using the old method
  private loadAdsFallback() {
    console.log('Using fallback method to load ads...');
    this.loading = true;
    this.adsService.list(this.currentPage, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Fallback response:', response);
        this.ads = response.data || [];
        this.totalPages = response.totalPages || 0;
        this.loading = false;
        console.log(`Fallback found ${this.ads.length} ads`);
      },
      error: (error) => {
        console.error('Fallback error:', error);
        // If fallback also fails, try direct method
        console.log('Fallback failed, trying direct method...');
        this.loadAdsDirect();
      }
    });
  }

  // Direct fallback to load ads without any filters
  private loadAdsDirect() {
    console.log('Using direct method to load ads...');
    this.loading = true;
    this.adsService.list(this.currentPage, this.pageSize).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Direct response:', response);
        this.ads = response.data || [];
        this.totalPages = response.totalPages || 0;
        this.loading = false;
        console.log(`Direct found ${this.ads.length} ads`);
      },
      error: (error) => {
        console.error('Direct error:', error);
        this.ads = [];
        this.totalPages = 0;
        this.loading = false;
      }
    });
  }

  private buildSearchUrl(): string {
    const params = new URLSearchParams();
    if (this.searchRequest.searchTerm) params.append('searchTerm', this.searchRequest.searchTerm);
    if (this.searchRequest.categoryId) params.append('categoryId', this.searchRequest.categoryId.toString());
    if (this.searchRequest.status) params.append('status', this.searchRequest.status);
    if (this.searchRequest.createdFrom) params.append('createdFrom', this.searchRequest.createdFrom.toISOString());
    if (this.searchRequest.createdTo) params.append('createdTo', this.searchRequest.createdTo.toISOString());
    if (this.searchRequest.page) params.append('page', this.searchRequest.page.toString());
    if (this.searchRequest.pageSize) params.append('pageSize', this.searchRequest.pageSize.toString());
    
    return `/ads/search?${params.toString()}`;
  }

  clearSearch() {
    this.searchForm.reset();
    this.currentPage = 1;
    // The search will be triggered automatically by form reset
    console.log('Search cleared, resetting to page 1');
  }

  onPageChange(page: number) {
    this.currentPage = page;
    console.log(`Page changed to: ${page}`);
    // Apply filters with new page
    this.applyFilters();
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
    if (price === 0) return 'مجاناً';
    return new Intl.NumberFormat('ar-SA').format(price) + ' ريال';
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