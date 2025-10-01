import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Plus, Search, Filter, Grid, List, Eye, Heart, MessageSquare, MapPin, Calendar, User, MoreVertical, Edit, Trash2 } from 'lucide-angular';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../../core/services/ads.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { AuthService } from '../../../../core/services/auth.service';
import { AdDto, AdSearchRequest, AdStatus } from '../../../../models/ads.models';
import { CategoryDto } from '../../../../models/categories.models';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { SearchComponent } from '../../../../shared/components/search/search.component';
// import { CardComponent } from '../../../../shared/components/card/card.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ads-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatGridListModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule,
    LucideAngularModule,
    PaginationComponent,
    SearchComponent,
    // CardComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './ads-list.component.html',
  styleUrls: ['./ads-list.component.scss']
})
export class AdsListComponent implements OnInit, OnDestroy {
  ads: AdDto[] = [];
  categories: CategoryDto[] = [];
  filteredAds: AdDto[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  totalCount = 0;
  totalPages = 0;
  
  // Loading states
  isLoading = false;
  isLoadingMore = false;
  
  // Search and filters
  searchTerm = '';
  selectedCategory: number | null = null;
  selectedStatus: AdStatus | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  location = '';
  
  // View mode
  viewMode: 'grid' | 'list' = 'grid';
  
  // Sort options
  sortBy: 'price' | 'date' | 'views' | 'likes' = 'date';
  sortOrder: 'asc' | 'desc' = 'desc';
  
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
  private searchSubject = new Subject<string>();

  // Inject services using inject() function
  private adsService = inject(AdsService);
  private categoriesService = inject(CategoriesService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);

  constructor() {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchTerm = searchTerm;
      this.currentPage = 1;
      this.loadAds();
    });
  }

  ngOnInit() {
    // Initialize auth service
    this.authService.initializeAuth();
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      console.log('User changed:', user);
    });
    
    this.loadCategories();
    this.loadAds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error: unknown) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  loadAds() {
    this.isLoading = true;
    
    const searchRequest: AdSearchRequest = {
      query: this.searchTerm || undefined,
      categoryId: this.selectedCategory || undefined,
      minPrice: this.minPrice || undefined,
      maxPrice: this.maxPrice || undefined,
      location: this.location || undefined,
      status: this.selectedStatus || undefined,
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };

    this.adsService.searchAds(searchRequest).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.ads = response.data;
          this.filteredAds = [...this.ads];
          this.totalCount = response.data.length; // This should come from pagination meta
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error('حدث خطأ أثناء تحميل الإعلانات', 'خطأ');
        console.error('Error loading ads:', error);
      }
    });
  }

  onSearch(searchTerm: string) {
    this.searchSubject.next(searchTerm);
  }

  onAdvancedSearch(searchData: any) {
    this.searchTerm = searchData.searchTerm || '';
    this.selectedCategory = searchData.filters?.categoryId || null;
    this.minPrice = searchData.filters?.minPrice || null;
    this.maxPrice = searchData.filters?.maxPrice || null;
    this.location = searchData.filters?.location || '';
    this.selectedStatus = searchData.filters?.status || null;
    this.sortBy = searchData.filters?.sortBy || 'date';
    this.currentPage = 1;
    this.loadAds();
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAds();
  }

  onCategoryFilter(categoryId: number | null) {
    this.selectedCategory = categoryId;
    this.currentPage = 1;
    this.loadAds();
  }

  onStatusFilter(status: AdStatus | null) {
    this.selectedStatus = status;
    this.currentPage = 1;
    this.loadAds();
  }

  onSortChange(sortBy: 'price' | 'date' | 'views' | 'likes', sortOrder: 'asc' | 'desc') {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.currentPage = 1;
    this.loadAds();
  }

  toggleViewMode() {
    this.viewMode = this.viewMode === 'grid' ? 'list' : 'grid';
  }

  onAdClick(ad: AdDto) {
    // Track ad view
    this.adsService.incrementView(ad.id).subscribe({
      next: () => {
        // View tracked successfully
      },
      error: (error) => {
        console.error('Error tracking view:', error);
      }
    });
  }

  onAdLike(ad: AdDto) {
    this.adsService.likeAd(ad.id).subscribe({
      next: () => {
        ad.likesCount++;
        this.toastr.success('تم إضافة الإعجاب', 'تم');
      },
      error: (error) => {
        this.toastr.error('حدث خطأ أثناء إضافة الإعجاب', 'خطأ');
      }
    });
  }

  onAdShare(ad: AdDto) {
    // Implement share functionality
    if (navigator.share) {
      navigator.share({
        title: ad.title,
        text: ad.description,
        url: window.location.origin + `/ads/details/${ad.id}`
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/ads/details/${ad.id}`);
      this.toastr.success('تم نسخ رابط الإعلان', 'تم');
    }
  }

  getStatusColor(status: AdStatus): string {
    switch (status) {
      case 'Published': return 'success';
      case 'Pending': return 'warning';
      case 'Draft': return 'info';
      case 'Rejected': return 'error';
      case 'Archived': return 'default';
      default: return 'default';
    }
  }

  getStatusText(status: AdStatus): string {
    switch (status) {
      case 'Published': return 'منشور';
      case 'Pending': return 'في الانتظار';
      case 'Draft': return 'مسودة';
      case 'Rejected': return 'مرفوض';
      case 'Archived': return 'مؤرشف';
      default: return status;
    }
  }
}
