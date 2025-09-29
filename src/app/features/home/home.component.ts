import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule } from 'lucide-angular';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { NotificationService } from '../../shared/services/notification.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, LucideAngularModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  ads: AdItem[] = [];
  loading = true;
  error = '';
  skeletons = Array.from({ length: 6 });
  
  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  totalAds = 0;
  hasMoreAds = false;
  
  // Filters
  selectedCategory = '';
  selectedLocation = '';
  priceRange = { min: 0, max: 1000000 };
  sortBy = 'newest';
  
  // Filter options
  categories = ['الكل', 'عقارات', 'سيارات', 'إلكترونيات', 'منزل وحديقة', 'موضة وجمال', 'وظائف', 'خدمات', 'أخرى'];
  locations = ['الكل', 'الرياض', 'جدة', 'مكة', 'المدينة', 'الدمام', 'الخبر', 'الهفوف', 'بريدة', 'تبوك', 'الطائف', 'خميس مشيط'];
  sortOptions = [
    { value: 'newest', label: 'الأحدث أولاً' },
    { value: 'price_low', label: 'السعر: من أقل لأعلى' },
    { value: 'price_high', label: 'السعر: من أعلى لأقل' },
    { value: 'most_viewed', label: 'الأكثر مشاهدة' },
    { value: 'most_liked', label: 'الأكثر إعجاباً' }
  ];
  
  // Navigation properties
  activeTab: string = '';
  showProfileMenu = false;
  showFilters = false;
  unreadMessages = 0;
  unreadNotifications = 0;
  searchQuery = '';
  
  // Language selector
  language = 'AR'; // AR or EN
  
  constructor(
    private adsService: AdsService,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private notificationsService: NotificationService,
    private toastr: ToastrService
  ){
    // Check for URL parameters and redirect if needed
    this.checkUrlParameters();
  }

  private checkUrlParameters(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    
    // Check if this is a password reset link (usually has userId and token, no email)
    if (userId && token && !email) {
      console.log('Detected userId and token parameters for password reset, redirecting to reset-password');
      this.router.navigate(['/auth/reset'], { 
        queryParams: { token: token, userId: userId },
        replaceUrl: true 
      });
      return;
    }
    
    // Check if this is an email verification link with userId and token
    if (userId && token && email) {
      console.log('Detected userId, token and email parameters, redirecting to verify-email');
      this.router.navigate(['/auth/verify-email'], { 
        queryParams: { token: token, userId: userId, email: email },
        replaceUrl: true 
      });
      return;
    }
    
    // Check for email verification with just token and email
    if (token && email && !userId) {
      console.log('Detected token and email parameters, redirecting to verify-email');
      this.router.navigate(['/auth/verify-email'], { 
        queryParams: { token: token, email: email },
        replaceUrl: true 
      });
      return;
    }
  }

  ngOnInit(): void {
    // Initialize component
    console.log('HomeComponent initialized');
    this.loadAds();
    // Load additional data after mounting
    setTimeout(() => {
      this.loadNotifications();
      this.loadConversations();
    }, 500);
  }

  // Navigation methods
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Search functionality
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/ads'], { 
        queryParams: { search: this.searchQuery.trim() }
      });
    }
  }

  onSearchInput(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.ads = [];
    this.loadAds();
  }

  loadAds(): void {
    this.loading = true;
    this.error = '';
    
    this.adsService.list().subscribe({
      next: (list: any) => {
        const adsList = list.data || list || [];
        this.totalAds = list.totalCount || adsList.length;
        this.hasMoreAds = adsList.length === this.pageSize;
        
        if (this.currentPage === 1) {
          this.ads = adsList;
        } else {
          this.ads = [...this.ads, ...adsList];
        }
        
        this.loading = false;
        console.log('Ads loaded:', adsList);
        
        // Fallback data if no ads
        if (adsList.length === 0 && this.currentPage === 1) {
          this.ads = [
            {
              id: '1',
              title: 'iPhone 14 Pro Max',
              description: 'Mint condition, 256GB, Space Black',
              location: 'Riyadh',
              price: 4200,
              status: 'Published',
              createdAt: new Date(),
              viewsCount: 0,
              clicksCount: 0,
              likesCount: 0,
              commentsCount: 0,
              userName: 'User',
              images: ['/assets/iphone.jpg'],
              keywords: ['iPhone', 'mobile'],
              isAIGenerated: false
            },
            {
              id: '2',
              title: 'Toyota Camry 2018',
              description: 'Excellent condition, full option',
              location: 'Jeddah',
              price: 52000,
              status: 'Published',
              createdAt: new Date(),
              viewsCount: 0,
              clicksCount: 0,
              likesCount: 0,
              commentsCount: 0,
              userName: 'User',
              images: ['/assets/car.jpg'],
              keywords: ['Toyota', 'car'],
              isAIGenerated: false
            }
          ];
        }
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'فشل في تحميل الإعلانات';
        console.error('Error loading ads:', err);
      }
    });
  }

  loadMoreAds(): void {
    if (this.hasMoreAds && !this.loading) {
      this.currentPage++;
      this.loadAds();
    }
  }

  loadNotifications(): void {
    // Mock data for notifications
    this.unreadNotifications = 3;
    console.log('Notifications loaded:', this.unreadNotifications);
  }

  loadConversations(): void {
    // Mock data for conversations
    this.unreadMessages = 2;
    console.log('Conversations loaded:', this.unreadMessages);
  }

  // Utility methods
  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Published': 'نشر',
      'Draft': 'مسودة',
      'Active': 'نشط',
      'Paused': 'متوقف',
      'Pending': 'في الانتظار',
      'Approved': 'معتمد',
      'Rejected': 'مرفوض'
    };
    return statusMap[status] || status;
  }

  retryLoading(): void {
    this.loading = true;
    this.error = '';
    // Reload data
    this.adsService.list().subscribe({
      next: (list) => { 
        this.ads = list; 
        this.loading = false; 
      },
      error: (err) => { 
        this.error = 'فشل في تحميل الإعلانات';
        this.loading = false; 
      }
    });
  }
}
