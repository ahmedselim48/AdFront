import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTabsModule } from '@angular/material/tabs';
import { LucideAngularModule, Plus, TrendingUp, Eye, Heart, MessageSquare, Users, Calendar, Bell, Settings, BarChart3 } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../../core/services/ads.service';
import { NotificationsService } from '../../../../core/services/notifications.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { SignalRService } from '../../../../core/services/signalr.service';
import { AdDto, AdStatus } from '../../../../models/ads.models';
import { UserDashboard, SubscriptionStatus } from '../../../../models/auth.models';
import { NotificationDto } from '../../../../models/notifications.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { StatsOverviewComponent } from '../stats-overview/stats-overview.component';
import { PerformanceChartComponent } from '../performance-chart/performance-chart.component';
import { RecentActivityComponent } from '../recent-activity/recent-activity.component';
import { QuickActionsComponent } from '../quick-actions/quick-actions.component';
import { NotificationsWidgetComponent } from '../notifications-widget/notifications-widget.component';
import { SubscriptionStatusComponent } from '../subscription-status/subscription-status.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatGridListModule,
    MatTabsModule,
    LucideAngularModule,
    LoadingSpinnerComponent,
    StatsOverviewComponent,
    PerformanceChartComponent,
    RecentActivityComponent,
    QuickActionsComponent,
    NotificationsWidgetComponent,
    SubscriptionStatusComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Data
  userDashboard: UserDashboard | null = null;
  recentAds: AdDto[] = [];
  notifications: NotificationDto[] = [];
  subscriptionStatus: SubscriptionStatus | null = null;
  
  // Loading states
  isLoading = false;
  isLoadingRecentAds = false;
  isLoadingNotifications = false;
  
  // User info
  currentUser: any = null;

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private adsService = inject(AdsService);
  private notificationsService = inject(NotificationsService);
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  private toastr = inject(ToastrService);

  ngOnInit() {
    this.loadDashboardData();
    this.loadUserInfo();
    this.initializeSignalR();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserInfo() {
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      this.currentUser = user;
    });
  }

  loadDashboardData() {
    this.isLoading = true;

    // Load dashboard data
    this.authService.getDashboard().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userDashboard = response.data;
          this.recentAds = response.data.recentAds || [];
          this.subscriptionStatus = response.data.subscriptionStatus;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.toastr.error('حدث خطأ أثناء تحميل بيانات لوحة التحكم', 'خطأ');
        console.error('Error loading dashboard:', error);
      }
    });

    // Load notifications
    this.loadNotifications();
  }

  loadNotifications() {
    this.isLoadingNotifications = true;

    this.notificationsService.getNotifications().subscribe({
      next: (response) => {
        this.isLoadingNotifications = false;
        if (response.success && response.data) {
          this.notifications = response.data;
        }
      },
      error: (error) => {
        this.isLoadingNotifications = false;
        console.error('Error loading notifications:', error);
      }
    });
  }

  loadRecentAds() {
    this.isLoadingRecentAds = true;

    this.adsService.getMyAds().subscribe({
      next: (response) => {
        this.isLoadingRecentAds = false;
        if (response.success && response.data) {
          this.recentAds = response.data.slice(0, 5); // Get latest 5 ads
        }
      },
      error: (error) => {
        this.isLoadingRecentAds = false;
        console.error('Error loading recent ads:', error);
      }
    });
  }

  onRefresh() {
    this.loadDashboardData();
    this.toastr.success('تم تحديث البيانات', 'تم');
  }

  onQuickAction(action: string) {
    switch (action) {
      case 'create-ad':
        // Navigate to create ad
        break;
      case 'view-ads':
        // Navigate to ads list
        break;
      case 'analytics':
        // Navigate to analytics
        break;
      case 'settings':
        // Navigate to settings
        break;
      default:
        this.toastr.info(`جاري تنفيذ: ${action}`, 'قريباً');
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

  getTotalViews(): number {
    return this.recentAds.reduce((total, ad) => total + ad.viewsCount, 0);
  }

  getTotalLikes(): number {
    return this.recentAds.reduce((total, ad) => total + ad.likesCount, 0);
  }

  getTotalComments(): number {
    return this.recentAds.reduce((total, ad) => total + ad.commentsCount, 0);
  }

  private initializeSignalR() {
    // بدء SignalR connection
    this.signalRService.startConnection();
    
    // الاشتراك في الإشعارات الجديدة
    this.signalRService.notifications$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(notifications => {
      // تحديث قائمة الإشعارات في dashboard
      this.notifications = this.signalRService.convertToNotificationDtoArray(notifications).slice(0, 5); // آخر 5 إشعارات
    });
  }
}
