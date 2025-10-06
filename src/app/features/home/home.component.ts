import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatSliderModule } from '@angular/material/slider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { LucideAngularModule } from 'lucide-angular';
import { AdsService } from '../../core/services/ads.service';
import { AdItem } from '../../models/ads.models';
import { AdFilters } from '../../models/ads.models';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { NotificationService } from '../../shared/services/notification.service';
import { PublicProfileService } from '../../core/services/public-profile.service';
import { DirectChatService } from '../../core/services/direct-chat.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { CompetitionService } from '../../core/services/competition.service';
import { AuthService } from '../../core/auth/auth.service';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    MatIconModule, 
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatSliderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    LucideAngularModule, 
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private statisticsService = inject(StatisticsService);
  private competitionService = inject(CompetitionService);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  
  // User authentication state
  isLoggedIn = false;
  
  ads: AdItem[] = [];
  loading = true;
  error = '';
  skeletons = Array.from({ length: 6 });
  
  // Dynamic Statistics - Initialize with temporary static data
  platformStats = {
    totalUsers: 12500,
    totalAds: 3400,
    totalSmartReplies: 15600,
    totalCompetitionAnalyses: 890,
    totalViews: 2400000,
    salesIncrease: 250,
    userRating: 4.8
  };
  
  heroStats = {
    smartAds: 3400,
    smartReplies: 15600,
    salesIncrease: 250
  };
  
  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalAds = 0;
  hasMoreAds = false;
  
  // Advanced Filters
  filterForm!: FormGroup;
  showAdvancedFilters = false;
  
  // Filter options
  categories = [
    { value: '', label: 'جميع الفئات' },
    { value: '1', label: 'عقارات' },
    { value: '2', label: 'سيارات' },
    { value: '3', label: 'إلكترونيات' },
    { value: '4', label: 'منزل وحديقة' },
    { value: '5', label: 'موضة وجمال' },
    { value: '6', label: 'وظائف' },
    { value: '7', label: 'خدمات' },
    { value: '8', label: 'أخرى' }
  ];
  
  locations = [
    { value: '', label: 'جميع المناطق' },
    { value: 'الرياض', label: 'الرياض' },
    { value: 'جدة', label: 'جدة' },
    { value: 'مكة', label: 'مكة' },
    { value: 'المدينة', label: 'المدينة' },
    { value: 'الدمام', label: 'الدمام' },
    { value: 'الخبر', label: 'الخبر' },
    { value: 'الهفوف', label: 'الهفوف' },
    { value: 'بريدة', label: 'بريدة' },
    { value: 'تبوك', label: 'تبوك' },
    { value: 'الطائف', label: 'الطائف' },
    { value: 'خميس مشيط', label: 'خميس مشيط' }
  ];
  
  sortOptions = [
    { value: 'newest', label: 'الأحدث أولاً' },
    { value: 'oldest', label: 'الأقدم أولاً' },
    { value: 'price_low', label: 'السعر: من أقل لأعلى' },
    { value: 'price_high', label: 'السعر: من أعلى لأقل' },
    { value: 'most_viewed', label: 'الأكثر مشاهدة' },
    { value: 'most_liked', label: 'الأكثر إعجاباً' },
    { value: 'most_commented', label: 'الأكثر تعليقاً' }
  ];
  
  statusOptions = [
    { value: '', label: 'جميع الحالات' },
    { value: 'Published', label: 'منشور' },
    { value: 'Active', label: 'نشط' },
    { value: 'Pending', label: 'في الانتظار' }
  ];
  
  // Navigation properties
  activeTab: string = '';
  showProfileMenu = false;
  unreadMessages = 0;
  unreadNotifications = 0;
  
  // Language selector
  language = 'AR'; // AR or EN
  
  // Dashboard interaction states
  isDashboardHovered = false;
  isCounting = false;
  
  constructor(
    private adsService: AdsService,
    private route: ActivatedRoute,
    private router: Router,
    private chatService: ChatService,
    private notificationsService: NotificationService,
    private publicProfileService: PublicProfileService,
    private directChatService: DirectChatService,
    private toastr: ToastrService,
    private fb: FormBuilder
  ){
    // Check for URL parameters and redirect if needed
    this.checkUrlParameters();
    this.initializeFilterForm();
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
    console.log('Initial platform stats:', this.platformStats);
    console.log('Initial hero stats:', this.heroStats);
    
    // Check authentication state
    this.checkAuthState();
    
    // Force update UI with default values
    this.cdr.detectChanges();
    
    this.loadAds();
    this.loadPlatformStatistics();
    this.setupSearchSubscription();
    // Load additional data after mounting
    setTimeout(() => {
      this.loadNotifications();
      this.loadConversations();
    }, 500);

    // slider removed
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private checkAuthState(): void {
    this.isLoggedIn = !!this.authService.isLoggedIn();
    console.log('User authentication state:', this.isLoggedIn);
    
    // Subscribe to auth state changes
    this.authService.currentUser$
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.isLoggedIn = !!user;
        console.log('Auth state changed:', this.isLoggedIn);
        this.cdr.detectChanges();
      });
  }

  private loadPlatformStatistics(): void {
    console.log('Loading platform statistics from API...');
    
    // Load basic platform statistics from API
    this.statisticsService.getPublicStatistics()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('Statistics API response:', response);
          if (response.success && response.data) {
            this.platformStats.totalUsers = response.data.totalUsers || 0;
            this.platformStats.totalAds = response.data.totalAds || 0;
            this.platformStats.totalViews = (response.data as any).totalViews || 0;
            // this.platformStats.totalEarnings = response.data.totalEarnings || 0;
            
            // Update hero stats
            this.heroStats.smartAds = this.platformStats.totalAds;
            this.heroStats.salesIncrease = this.calculateSalesIncrease();
            
            console.log('Platform stats loaded from API:', this.platformStats);
            console.log('Hero stats updated:', this.heroStats);
            
            // Trigger change detection
            this.cdr.detectChanges();
          } else {
            console.log('No data received from statistics API');
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Error loading statistics from API:', error);
          this.cdr.detectChanges();
        }
      });

    // Load smart replies count from API
    this.loadSmartRepliesCount();
    
    // Load competition analyses count from API
    this.loadCompetitionAnalysesCount();
  }

  private loadSmartRepliesCount(): void {
    console.log('Loading smart replies count from API...');
    
    // Load smart replies count from API
    this.chatService.getTemplates()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (templates) => {
          console.log('Smart replies API response:', templates);
          this.platformStats.totalSmartReplies = templates.length;
          this.heroStats.smartReplies = this.platformStats.totalSmartReplies;
          console.log('Smart replies count loaded from API:', this.platformStats.totalSmartReplies);
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading smart replies from API:', error);
          this.cdr.detectChanges();
        }
      });
  }

  private loadCompetitionAnalysesCount(): void {
    console.log('Loading competition analyses count from API...');
    
    // Load competition analyses count from API
    this.competitionService.getUserAnalyses(1, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log('Competition analyses API response:', response);
          if (response.success && response.data) {
            this.platformStats.totalCompetitionAnalyses = response.data.length || 0;
          } else {
            this.platformStats.totalCompetitionAnalyses = 0;
          }
          console.log('Competition analyses count loaded from API:', this.platformStats.totalCompetitionAnalyses);
          this.cdr.detectChanges();
        },
        error: (error: any) => {
          console.error('Error loading competition analyses from API:', error);
          this.cdr.detectChanges();
        }
      });
  }


  formatNumber(num: number): string {
    if (!num || num === 0) return '0';
    
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K';
    }
    return num.toString();
  }

  private calculateSalesIncrease(): number {
    // Calculate sales increase based on platform data
    // This is a simple calculation - you can make it more sophisticated
    if (this.platformStats.totalAds > 0) {
      return Math.min(300, Math.floor(this.platformStats.totalAds / 100));
    }
    return 0;
  }

  private initializeFilterForm(): void {
    this.filterForm = this.fb.group({
      searchTerm: [''],
      categoryId: [''],
      location: [''],
      minPrice: [null],
      maxPrice: [null],
      status: [''],
      sortBy: ['newest'],
      dateFrom: [null],
      dateTo: [null]
    });
  }

  // slider code removed

  private setupSearchSubscription(): void {
    this.filterForm.get('searchTerm')?.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.applyFilters();
    });
  }

  // Navigation methods
  toggleProfileMenu(): void {
    this.showProfileMenu = !this.showProfileMenu;
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  // Dashboard interaction methods
  onDashboardHover(): void {
    this.isDashboardHovered = true;
    this.isCounting = true;
    
    // Reset counting animation after delay
    setTimeout(() => {
      this.isCounting = false;
    }, 2000);
  }

  onDashboardLeave(): void {
    this.isDashboardHovered = false;
  }

  onStatClick(statType: string): void {
    console.log(`Clicked on ${statType} stat`);
    // Add any specific logic for stat clicks
    // For example, navigate to detailed analytics
  }


  applyFilters(): void {
    this.currentPage = 1;
    this.ads = [];
    this.loadAds();
  }

  clearFilters(): void {
    this.filterForm.reset({
      searchTerm: '',
      categoryId: '',
      location: '',
      minPrice: null,
      maxPrice: null,
      status: '',
      sortBy: 'newest',
      dateFrom: null,
      dateTo: null
    });
    this.applyFilters();
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  loadAds(): void {
    this.loading = true;
    this.error = '';
    
    // Build filters from form
    const filters: AdFilters = {
      keyword: this.filterForm.get('searchTerm')?.value || undefined,
      categoryId: this.filterForm.get('categoryId')?.value || undefined,
      location: this.filterForm.get('location')?.value || undefined,
      minPrice: this.filterForm.get('minPrice')?.value || undefined,
      maxPrice: this.filterForm.get('maxPrice')?.value || undefined,
      status: this.filterForm.get('status')?.value || undefined,
      dateFrom: this.filterForm.get('dateFrom')?.value || undefined,
      dateTo: this.filterForm.get('dateTo')?.value || undefined
    };

    // Remove empty filters
    Object.keys(filters).forEach(key => {
      if (!filters[key as keyof AdFilters]) {
        delete filters[key as keyof AdFilters];
      }
    });
    
    this.adsService.getAll(this.currentPage, this.pageSize, filters).subscribe({
      next: (response: any) => {
        const adsList = response.data || response || [];
        this.totalAds = response.totalCount || adsList.length;
        this.hasMoreAds = adsList.length === this.pageSize;
        
        if (this.currentPage === 1) {
          this.ads = adsList;
        } else {
          this.ads = [...this.ads, ...adsList];
        }
        
        this.loading = false;
        console.log('Ads loaded from API:', adsList);
      },
      error: (err: any) => {
        this.loading = false;
        this.error = 'فشل في تحميل الإعلانات من الخادم';
        console.error('Error loading ads from API:', err);
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
    this.loadAds();
  }

  // Navigate to public profile
  onUserClick(userId: string): void {
    this.router.navigate(['/u', userId]);
  }

  // Start direct chat
  onContactUser(ad: AdItem): void {
    if (!ad.userId) {
      this.toastr.error('معلومات المستخدم غير متاحة', 'خطأ');
      return;
    }

    this.directChatService.getOrCreateConversation(ad.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          // Navigate to chat page
          this.router.navigate(['/chat', response.data.id]);
        } else {
          this.toastr.error('فشل في إنشاء المحادثة', 'خطأ');
        }
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
        this.toastr.error('فشل في إنشاء المحادثة', 'خطأ');
      }
    });
  }

  // Call phone number
  onCallPhone(phoneNumber: string): void {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }

  // Open WhatsApp
  onOpenWhatsApp(whatsappNumber: string, adTitle: string): void {
    if (whatsappNumber) {
      const message = `مرحباً، أنا مهتم بالإعلان: ${adTitle}`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    }
  }

  // Send email
  onSendEmail(email: string, adTitle: string): void {
    if (email) {
      const subject = `استفسار حول الإعلان: ${adTitle}`;
      const body = `مرحباً،\n\nأنا مهتم بالإعلان: ${adTitle}\n\nهل يمكنك تزويدي بمزيد من التفاصيل؟\n\nشكراً لك`;
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_self');
    }
  }
}