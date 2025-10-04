import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { LucideAngularModule, Eye, MessageCircle, Heart, TrendingUp, Calendar, RefreshCw, BarChart3, Users, Target } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ProfileService } from '../../../../core/services/profile.service';
import { AdsService } from '../../../ads/ads.service';
import { UserDashboardDto } from '../../../../models/auth.models';
import { DashboardStatsDto } from '../../../../models/profile.models';
import { AdItem } from '../../../../models/ads.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    LucideAngularModule
  ],
  templateUrl: './profile-dashboard.component.html',
  styleUrls: ['./profile-dashboard.component.scss']
})
export class ProfileDashboardComponent implements OnInit, OnDestroy {
  dashboardData: UserDashboardDto | null = null;
  stats: DashboardStatsDto | null = null;
  ads: AdItem[] = [];
  recentAds: AdItem[] = [];
  topPerformingAds: AdItem[] = [];
  isLoading = false;
  adsLoading = false;

  private destroy$ = new Subject<void>();
  private profileService = inject(ProfileService);
  private adsService = inject(AdsService);
  private toastr = inject(ToastrService);
  private router = inject(Router);

  ngOnInit() {
    this.loadDashboardData();
    this.loadAdsData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData() {
    this.isLoading = true;
    
    this.profileService.getDashboard().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.dashboardData = response.data;
          this.generateStats(response.data);
        }
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading dashboard data:', error);
        this.toastr.error('فشل في تحميل بيانات لوحة التحكم', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  private generateStats(data: UserDashboardDto) {
    // Generate mock stats based on available data
    this.stats = {
      totalAds: data.totalAds || 0,
      activeAds: data.activeAds || 0,
      totalViews: data.totalViews || 0,
      totalClicks: data.totalClicks || 0,
      totalLikes: Math.floor((data.totalViews || 0) * 0.1), // Mock calculation
      totalMessages: 15, // Mock data
      unreadMessages: 3, // Mock data
      conversionRate: data.totalClicks && data.totalViews ? 
        ((data.totalClicks / data.totalViews) * 100) : 0,
      averagePrice: 2500, // Mock data
      topCategory: 'سيارات', // Mock data
      recentActivity: [
        {
          id: '1',
          type: 'ad_published',
          title: 'تم نشر إعلان جديد',
          description: 'سيارة تويوتا كامري 2020',
          timestamp: new Date(),
          createdAt: new Date(),
          data: { adId: '1' }
        },
        {
          id: '2',
          type: 'message_received',
          title: 'رسالة جديدة',
          description: 'استفسار عن السعر',
          timestamp: new Date(Date.now() - 3600000),
          createdAt: new Date(Date.now() - 3600000),
          data: { messageId: '1' }
        },
        {
          id: '3',
          type: 'view_increase',
          title: 'زيادة في المشاهدات',
          description: 'إعلانك حصل على 50 مشاهدة جديدة',
          timestamp: new Date(Date.now() - 7200000),
          createdAt: new Date(Date.now() - 7200000),
          data: { adId: '2' }
        }
      ]
    };
  }

  loadAdsData() {
    this.adsLoading = true;
    
    this.adsService.getMyAds().pipe(takeUntil(this.destroy$)).subscribe({
      next: (ads: AdItem[]) => {
        this.ads = ads;
        this.processAdsData(ads);
        this.adsLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading ads:', error);
        this.adsLoading = false;
      }
    });
  }

  private processAdsData(ads: AdItem[]) {
    // Get recent ads (last 5)
    this.recentAds = [...ads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Get top performing ads (by views + likes + comments)
    this.topPerformingAds = [...ads]
      .sort((a, b) => {
        const scoreA = (a.viewsCount || 0) + (a.likesCount || 0) + (a.commentsCount || 0);
        const scoreB = (b.viewsCount || 0) + (b.likesCount || 0) + (b.commentsCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, 3);
  }

  onRefresh() {
    this.loadDashboardData();
    this.loadAdsData();
    this.toastr.success('تم تحديث البيانات', 'تم');
  }

  getActivityIcon(type: string): string {
    switch (type) {
      case 'ad_published': return 'eye';
      case 'message_received': return 'message-circle';
      case 'view_increase': return 'trending-up';
      case 'like_received': return 'heart';
      default: return 'activity';
    }
  }

  getActivityColor(type: string): string {
    switch (type) {
      case 'ad_published': return 'primary';
      case 'message_received': return 'accent';
      case 'view_increase': return 'success';
      case 'like_received': return 'warn';
      default: return 'primary';
    }
  }

  formatNumber(num: number): string {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) {
      return 'غير محدد';
    }
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  trackByActivityId(index: number, activity: any): string {
    return activity.id;
  }

  // Ads Analytics Methods
  getTotalAdsCount(): number {
    return this.ads.length;
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

  getClickThroughRate(): number {
    const totalViews = this.getTotalViews();
    if (totalViews === 0) return 0;
    return Math.round((this.getTotalClicks() / totalViews) * 100 * 100) / 100;
  }

  getEngagementRate(): number {
    const totalViews = this.getTotalViews();
    if (totalViews === 0) return 0;
    const totalEngagement = this.getTotalLikes() + this.getTotalComments();
    return Math.round((totalEngagement / totalViews) * 100 * 100) / 100;
  }

  getAverageViewsPerAd(): number {
    if (this.ads.length === 0) return 0;
    return Math.round(this.getTotalViews() / this.ads.length);
  }

  getTopCategory(): string {
    const categoryCount: { [key: string]: number } = {};
    this.ads.forEach(ad => {
      const category = ad.categoryName || 'غير محدد';
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });
    
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

  getAdsByStatus(status: string): AdItem[] {
    return this.ads.filter(ad => ad.status === status);
  }

  // Navigation Methods
  onCreateAd() {
    this.router.navigate(['/ads/create']);
  }

  onViewAd(ad: AdItem) {
    this.router.navigate(['/ads', ad.id]);
  }

  onEditAd(ad: AdItem) {
    this.router.navigate(['/ads', ad.id, 'edit']);
  }

  onViewAllAds() {
    this.router.navigate(['/profile/ads']);
  }

  onViewAnalytics(ad: AdItem) {
    this.router.navigate(['/ads', ad.id, 'analytics']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  getAdStatusColor(status: string): string {
    switch (status) {
      case 'Published': return 'primary';
      case 'Draft': return 'accent';
      case 'Pending': return 'warn';
      case 'Rejected': return 'warn';
      case 'Expired': return 'basic';
      default: return 'basic';
    }
  }

  getAdStatusLabel(status: string): string {
    switch (status) {
      case 'Published': return 'منشور';
      case 'Draft': return 'مسودة';
      case 'Pending': return 'في الانتظار';
      case 'Rejected': return 'مرفوض';
      case 'Expired': return 'منتهي الصلاحية';
      default: return 'غير محدد';
    }
  }

  trackByAdId(index: number, ad: AdItem): string {
    return ad.id;
  }
}
