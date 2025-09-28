import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { LucideAngularModule, Shield, Users, FileText, BarChart3, Bell, Settings, ArrowLeft } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdminService } from '../../../../core/services/admin.service';
import { AdminStatisticsDto } from '../../../../models/admin.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-admin',
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
    MatBadgeModule,
    LucideAngularModule,
    LoadingSpinnerComponent
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  // Data
  adminStats: AdminStatisticsDto | null = null;
  
  // Loading states
  isLoading = false;
  
  // Navigation
  activeTab = 0;
  
  // Menu items
  menuItems = [
    {
      id: 'dashboard',
      label: 'لوحة التحكم',
      icon: 'bar-chart-3',
      route: '/admin/dashboard'
    },
    {
      id: 'users',
      label: 'إدارة المستخدمين',
      icon: 'users',
      route: '/admin/users'
    },
    {
      id: 'ads',
      label: 'إدارة الإعلانات',
      icon: 'file-text',
      route: '/admin/ads'
    },
    {
      id: 'categories',
      label: 'إدارة الفئات',
      icon: 'tag',
      route: '/admin/categories'
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: 'bar-chart-3',
      route: '/admin/reports'
    },
    {
      id: 'notifications',
      label: 'الإشعارات',
      icon: 'bell',
      route: '/admin/notifications'
    }
  ];

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private adminService = inject(AdminService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  ngOnInit() {
    this.loadAdminStats();
    this.setActiveTabFromRoute();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdminStats() {
    this.isLoading = true;

    this.adminService.getStatistics().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.adminStats = response.data;
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.isLoading = false;
        this.toastr.error('حدث خطأ أثناء تحميل إحصائيات الإدارة', 'خطأ');
        console.error('Error loading admin stats:', error);
      }
    });
  }

  setActiveTabFromRoute() {
    this.route.url.pipe(takeUntil(this.destroy$)).subscribe(urlSegments => {
      const path = urlSegments[urlSegments.length - 1]?.path;
      const tabIndex = this.menuItems.findIndex(item => item.id === path);
      if (tabIndex !== -1) {
        this.activeTab = tabIndex;
      }
    });
  }

  onTabChange(index: number) {
    this.activeTab = index;
    const selectedItem = this.menuItems[index];
    this.router.navigate([selectedItem.route]);
  }

  onBackToDashboard() {
    this.router.navigate(['/dashboard']);
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
    // Calculate total views from top categories
    return this.adminStats?.topCategories?.reduce((total, category) => total + category.viewCount, 0) || 0;
  }

  getMenuBadge(itemId: string): number | null {
    // Return badge count based on item type
    switch (itemId) {
      case 'users':
        return this.adminStats?.blockedUsers || null;
      case 'ads':
        return this.adminStats?.pendingAds || null;
      case 'reports':
        return null; // No badge for reports
      default:
        return null;
    }
  }
}
