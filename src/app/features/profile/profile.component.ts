import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { LucideAngularModule, User, Settings, Shield, Bell, CreditCard, Camera, ArrowLeft, Mail, Phone, MapPin, Calendar, Save, Edit, Trash2, Eye, EyeOff, Home, MessageCircle, RefreshCw, Heart } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../core/auth/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { NotificationService } from '../../core/services/notification.service';
import { ProfileDto, SubscriptionStatusDto } from '../../models/profile.models';
import { UserDashboardDto } from '../../models/auth.models';
import { NotificationDto } from '../../models/notification.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    LucideAngularModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // User data
  currentUser: ProfileDto | null = null;
  subscriptionStatus: SubscriptionStatusDto | null = null;
  profileStats: UserDashboardDto | null = null;
  
  // UI state
  isLoading = false;
  isSaving = false;
  activeTab = 0;
  unreadNotifications: number = 0;
  
  // Menu items
  menuItems: Array<{label: string, icon: string, route: string, badge: string | null}> = [
    { label: 'الملف الشخصي', icon: 'user', route: 'profile-settings', badge: null },
    { label: 'لوحة التحكم', icon: 'home', route: 'dashboard', badge: null },
    { label: 'الإعلانات', icon: 'eye', route: 'ads', badge: null },
    { label: 'اختبارات A/B', icon: 'test-tube', route: 'ab-testing', badge: null },
    { label: 'تحليل المنافسة', icon: 'bar-chart-3', route: 'competition', badge: null },
    { label: 'الرسائل', icon: 'message-circle', route: 'messages', badge: null },
    { label: 'الإشعارات', icon: 'bell', route: 'notifications', badge: null },
    { label: 'الاشتراك', icon: 'credit-card', route: 'subscription', badge: null }
  ];
  
  private destroy$ = new Subject<void>();
  
  // Inject services
  private authService = inject(AuthService);
  private profileService = inject(ProfileService);
  private notificationService = inject(NotificationService);
  private toastr = inject(ToastrService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit() {
    this.loadUserData();
    this.setActiveTabFromRoute();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserData() {
    this.isLoading = true;
    
    // Load profile data
    this.profileService.getProfile().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Profile response:', response); // Debug log
        if (response && response.success && response.data) {
          this.currentUser = response.data;
          console.log('Current user loaded:', this.currentUser); // Debug log
          this.loadProfileStats();
        } else {
          console.warn('Profile response not successful or no data:', response);
          // Try to get user data from AuthService as fallback
          const authUser = this.authService.getCurrentUser();
          if (authUser) {
            this.currentUser = {
              id: authUser.id || '',
              userName: authUser.userName || '',
              email: authUser.email || '',
              firstName: authUser.firstName || '',
              lastName: authUser.lastName || '',
              fullName: authUser.fullName || '',
              phoneNumber: authUser.phoneNumber || '',
              profileImageUrl: authUser.profileImageUrl || '',
              createdAt: authUser.createdAt || new Date().toISOString(),
              isEmailConfirmed: authUser.isEmailConfirmed || false,
              isActive: authUser.isActive || true,
              roles: authUser.roles || []
            };
            console.log('Using fallback user data:', this.currentUser);
          } else {
            this.toastr.warning('لا توجد بيانات ملف شخصي', 'تحذير');
          }
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        // Try to get user data from AuthService as fallback
        const authUser = this.authService.getCurrentUser();
        if (authUser) {
          this.currentUser = {
            id: authUser.id || '',
            userName: authUser.userName || '',
            email: authUser.email || '',
            firstName: authUser.firstName || '',
            lastName: authUser.lastName || '',
            fullName: authUser.fullName || '',
            phoneNumber: authUser.phoneNumber || '',
            profileImageUrl: authUser.profileImageUrl || '',
            createdAt: authUser.createdAt || new Date().toISOString(),
            isEmailConfirmed: authUser.isEmailConfirmed || false,
            isActive: authUser.isActive || true,
            roles: authUser.roles || []
          };
          console.log('Using fallback user data after error:', this.currentUser);
          this.loadProfileStats();
        } else {
          this.toastr.error('فشل في تحميل بيانات الملف الشخصي', 'خطأ');
        }
        this.isLoading = false;
      }
    });

    // Load subscription status
    this.profileService.getSubscriptionStatus().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Subscription response:', response); // Debug log
        if (response && response.success && response.data) {
          this.subscriptionStatus = response.data;
          console.log('Subscription status loaded:', this.subscriptionStatus); // Debug log
        } else {
          console.warn('Subscription response not successful or no data:', response);
        }
      },
      error: (error) => {
        console.error('Error loading subscription status:', error);
        this.toastr.warning('فشل في تحميل حالة الاشتراك', 'تحذير');
      }
    });

    // Load notifications count
    this.notificationService.unreadCount$.pipe(takeUntil(this.destroy$)).subscribe((count: number) => {
      this.unreadNotifications = count;
      this.updateMenuBadges();
    });
  }

  loadProfileStats() {
    this.profileService.getDashboard().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        console.log('Dashboard response:', response); // Debug log
        if (response && response.success && response.data) {
          this.profileStats = response.data;
          console.log('Profile stats loaded:', this.profileStats); // Debug log
        } else {
          console.warn('Dashboard response not successful or no data:', response);
          this.toastr.warning('لا توجد إحصائيات متاحة', 'تحذير');
          }
        },
        error: (error) => {
        console.error('Error loading profile stats:', error);
        this.toastr.error('فشل في تحميل إحصائيات الملف الشخصي', 'خطأ');
      }
    });
  }

  // Removed loadAccountSettings method as it's not needed

  setActiveTabFromRoute() {
    const url = this.router.url;
    const tabIndex = this.menuItems.findIndex(item => url.includes(item.route));
    if (tabIndex !== -1) {
      this.activeTab = tabIndex;
    }
  }

  onTabChange(index: number) {
    this.activeTab = index;
    const menuItem = this.menuItems[index];
    if (menuItem) {
      this.router.navigate([menuItem.route], { relativeTo: this.route });
    }
  }

  onRefresh() {
    this.loadUserData();
    this.toastr.success('تم تحديث البيانات', 'تم');
  }

  onEditProfile() {
    this.router.navigate(['profile-settings'], { relativeTo: this.route });
  }

  getCurrentPageTitle(): string {
    const currentItem = this.menuItems[this.activeTab];
    return currentItem ? currentItem.label : 'الملف الشخصي';
  }

  getCurrentPageDescription(): string {
    const descriptions: { [key: string]: string } = {
      'profile-settings': 'إدارة معلوماتك الشخصية وإعدادات الحساب',
      'dashboard': 'عرض إحصائياتك وأداء إعلاناتك',
      'ads': 'إدارة إعلاناتك والتحكم في حالتها',
      'ab-testing': 'إدارة اختبارات A/B وتحليل الأداء',
      'competition': 'تحليل المنافسة واقتراحات تحسين الأداء',
      'messages': 'متابعة المحادثات والرسائل',
      'notifications': 'إدارة الإشعارات والتنبيهات',
      'subscription': 'إدارة اشتراكك وخطة الدفع'
    };
    
    const currentItem = this.menuItems[this.activeTab];
    return currentItem ? descriptions[currentItem.route] || '' : '';
  }

  updateMenuBadges() {
    // Update notification badge
    const notificationItem = this.menuItems.find(item => item.route === 'notifications');
    if (notificationItem) {
      notificationItem.badge = this.unreadNotifications > 0 ? this.unreadNotifications.toString() : null;
    }
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'صباح الخير';
    } else if (hour < 18) {
      return 'مساء الخير';
    } else {
      return 'مساء الخير';
    }
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getPlanColor(plan: string | undefined): string {
    if (!plan) return 'primary';
    
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'primary';
      case 'pro':
        return 'accent';
      case 'basic':
        return 'warn';
      default:
        return 'primary';
    }
  }

  getPlanLabel(plan: string | undefined): string {
    if (!plan) return 'مجاني';
    
    switch (plan.toLowerCase()) {
      case 'premium':
        return 'بريميوم';
      case 'pro':
        return 'برو';
      case 'basic':
        return 'أساسي';
      default:
        return 'مجاني';
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}