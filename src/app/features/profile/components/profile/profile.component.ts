import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, User, Settings, Shield, Bell, CreditCard, Camera, ArrowLeft } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserProfile, SubscriptionStatus } from '../../../../models/auth.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ProfilePictureComponent } from '../profile-picture/profile-picture.component';

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
    LucideAngularModule,
    LoadingSpinnerComponent,
    ProfilePictureComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  // User data
  currentUser: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;
  
  // Loading states
  isLoading = false;
  
  // Navigation
  activeTab = 0;
  
  // Menu items
  menuItems = [
    {
      id: 'settings',
      label: 'الإعدادات العامة',
      icon: 'settings',
      route: '/profile/settings'
    },
    {
      id: 'account',
      label: 'إعدادات الحساب',
      icon: 'user',
      route: '/profile/account'
    },
    {
      id: 'privacy',
      label: 'الخصوصية',
      icon: 'shield',
      route: '/profile/privacy'
    },
    {
      id: 'notifications',
      label: 'الإشعارات',
      icon: 'bell',
      route: '/profile/notifications'
    },
    {
      id: 'security',
      label: 'الأمان',
      icon: 'shield',
      route: '/profile/security'
    },
    {
      id: 'subscription',
      label: 'الاشتراك',
      icon: 'credit-card',
      route: '/profile/subscription'
    }
  ];

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

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

    // Load current user
    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe((user: UserProfile | null) => {
      this.currentUser = user;
    });

    // Load subscription status
    this.authService.getSubscriptionStatus().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.subscriptionStatus = response.data;
        }
        this.isLoading = false;
      },
      error: (error: unknown) => {
        this.isLoading = false;
        console.error('Error loading subscription status:', error);
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

  onProfileUpdate(updatedUser: UserProfile) {
    this.currentUser = updatedUser;
    this.toastr.success('تم تحديث الملف الشخصي بنجاح', 'تم');
  }

  onSubscriptionUpdate(updatedSubscription: SubscriptionStatus) {
    this.subscriptionStatus = updatedSubscription;
    this.toastr.success('تم تحديث الاشتراك بنجاح', 'تم');
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
