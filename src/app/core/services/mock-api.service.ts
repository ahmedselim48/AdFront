import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { GeneralResponse } from '../../models/general-response';
import { UserDashboard, SubscriptionStatus } from '../../models/auth.models';
import { NotificationDto } from '../../models/notifications.models';
import { AdDto } from '../../models/ads.models';

@Injectable({
  providedIn: 'root'
})
export class MockApiService {

  // Mock Dashboard Data
  getDashboard(): Observable<GeneralResponse<UserDashboard>> {
    const mockDashboard: UserDashboard = {
      totalAds: 15,
      publishedAds: 12,
      draftAds: 2,
      pendingAds: 1,
      totalViews: 1250,
      totalClicks: 89,
      totalLikes: 156,
      recentAds: this.getMockAds(),
      notifications: [],
      subscriptionStatus: {
        hasActive: true,
        daysRemaining: 30,
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
      }
    };

    return of({
      success: true,
      data: mockDashboard,
      message: 'Dashboard data loaded successfully'
    }).pipe(delay(1000));
  }

  // Mock Subscription Status Data
  getSubscriptionStatus(): Observable<GeneralResponse<SubscriptionStatus>> {
    const mockSubscription: SubscriptionStatus = {
      hasActive: true,
      daysRemaining: 30,
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    };

    return of({
      success: true,
      data: mockSubscription,
      message: 'Subscription status loaded successfully'
    }).pipe(delay(500));
  }

  // Mock Admin Statistics Data
  getAdminStatistics(): Observable<GeneralResponse<any>> {
    const mockStats = {
      totalUsers: 1250,
      totalAds: 3450,
      pendingAds: 23,
      blockedUsers: 5,
      topCategories: [
        { name: 'سيارات', viewCount: 1250, adCount: 450 },
        { name: 'عقارات', viewCount: 980, adCount: 320 },
        { name: 'إلكترونيات', viewCount: 750, adCount: 280 }
      ]
    };

    return of({
      success: true,
      data: mockStats,
      message: 'Admin statistics loaded successfully'
    }).pipe(delay(800));
  }

  // Mock Admin Dashboard Data
  getAdminDashboardStats(): Observable<GeneralResponse<any>> {
    const mockDashboard = {
      totalRevenue: 125000,
      monthlyGrowth: 15.5,
      activeUsers: 850,
      newUsersToday: 12,
      adsPublishedToday: 45,
      pendingApprovals: 8
    };

    return of({
      success: true,
      data: mockDashboard,
      message: 'Admin dashboard stats loaded successfully'
    }).pipe(delay(600));
  }

  // Mock Notifications Data
  getNotifications(): Observable<GeneralResponse<NotificationDto[]>> {
    const mockNotifications: NotificationDto[] = [
      {
        id: '1',
        type: 'AdPublished',
        title: 'تم نشر إعلانك',
        message: 'تم نشر إعلان "سيارة تويوتا 2020" بنجاح',
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        data: { adId: '123' }
      },
      {
        id: '2',
        type: 'NewMessage',
        title: 'رسالة جديدة',
        message: 'لديك رسالة جديدة من مشتري محتمل',
        isRead: false,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        data: { messageId: '456' }
      },
      {
        id: '3',
        type: 'ContactRequest',
        title: 'طلب اتصال',
        message: 'شخص مهتم بمنتجك يريد التواصل معك',
        isRead: true,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        data: { contactId: '789' }
      }
    ];

    return of({
      success: true,
      data: mockNotifications,
      message: 'Notifications loaded successfully'
    }).pipe(delay(800));
  }

  // Mock Ads Data
  private getMockAds(): AdDto[] {
    return [
      {
        id: '1',
        title: 'سيارة تويوتا كامري 2020',
        description: 'سيارة تويوتا كامري 2020 بحالة ممتازة، موديل 2020، لون أبيض، ماشية 50000 كم',
        price: 85000,
        categoryId: 1,
        categoryName: 'سيارات',
        location: 'الرياض',
        status: 'Published',
        viewsCount: 245,
        likesCount: 12,
        commentsCount: 3,
        clicksCount: 15,
        keywords: ['سيارة', 'تويوتا', 'كامري', '2020'],
        isAIGenerated: false,
        images: ['https://via.placeholder.com/300x200?text=Toyota+Camry'],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        userName: 'أحمد محمد',
      },
      {
        id: '2',
        title: 'شقة للإيجار في حي النرجس',
        description: 'شقة 3 غرف نوم، 2 حمام، صالة، مطبخ مجهز، مكيفات، موقف سيارة',
        price: 2500,
        categoryId: 2,
        categoryName: 'عقارات',
        location: 'الرياض',
        status: 'Published',
        viewsCount: 189,
        likesCount: 8,
        commentsCount: 1,
        clicksCount: 8,
        keywords: ['شقة', 'إيجار', 'النرجس', '3 غرف'],
        isAIGenerated: false,
        images: ['https://via.placeholder.com/300x200?text=Apartment'],
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        userName: 'أحمد محمد',
      },
      {
        id: '3',
        title: 'لابتوب Dell Inspiron 15',
        description: 'لابتوب Dell Inspiron 15، معالج Intel i7، 16GB RAM، 512GB SSD',
        price: 3500,
        categoryId: 3,
        categoryName: 'إلكترونيات',
        location: 'جدة',
        status: 'Draft',
        viewsCount: 67,
        likesCount: 3,
        commentsCount: 0,
        clicksCount: 3,
        keywords: ['لابتوب', 'Dell', 'Inspiron', 'i7'],
        isAIGenerated: true,
        images: ['https://via.placeholder.com/300x200?text=Dell+Laptop'],
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        userName: 'أحمد محمد',
      }
    ];
  }
}
