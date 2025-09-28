import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, Menu, User, Settings, LogOut } from 'lucide-angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { SignalRService } from '../../../core/services/signalr.service';
import { NotificationBellComponent } from '../notification-bell/notification-bell.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatDividerModule,
    LucideAngularModule,
    NotificationBellComponent
  ],
  template: `
    <mat-toolbar color="primary" class="header-toolbar">
      <div class="header-content">
        <!-- Logo and Title -->
        <div class="header-left">
          <button mat-icon-button (click)="toggleSidebar()" class="menu-button">
            <lucide-icon name="menu" size="24"></lucide-icon>
          </button>
          <a routerLink="/dashboard" class="logo-link">
            <h1 class="app-title">HarajPlus</h1>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="header-nav">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            لوحة التحكم
          </a>
          <a routerLink="/ads" routerLinkActive="active" class="nav-link">
            الإعلانات
          </a>
          <a routerLink="/competition" routerLinkActive="active" class="nav-link">
            تحليل المنافسة
          </a>
          <a routerLink="/chat" routerLinkActive="active" class="nav-link">
            المحادثات
          </a>
        </nav>

        <!-- Right Side Actions -->
        <div class="header-right">
          <!-- Notifications -->
          <app-notification-bell></app-notification-bell>

          <!-- User Menu -->
          <button 
            mat-icon-button 
            [matMenuTriggerFor]="userMenu"
            class="user-button">
            <lucide-icon name="user" size="24"></lucide-icon>
          </button>

          <mat-menu #userMenu="matMenu" class="user-menu">
            <div class="user-info">
              <div class="user-name">{{ currentUser?.firstName }} {{ currentUser?.lastName }}</div>
              <div class="user-email">{{ currentUser?.email }}</div>
            </div>
            
            <mat-divider></mat-divider>
            
            <button mat-menu-item routerLink="/profile">
              <lucide-icon name="user" size="16" class="menu-icon"></lucide-icon>
              الملف الشخصي
            </button>
            
            <button mat-menu-item routerLink="/settings">
              <lucide-icon name="settings" size="16" class="menu-icon"></lucide-icon>
              الإعدادات
            </button>
            
            <mat-divider></mat-divider>
            
            <button mat-menu-item (click)="logout()" class="logout-button">
              <lucide-icon name="log-out" size="16" class="menu-icon"></lucide-icon>
              تسجيل الخروج
            </button>
          </mat-menu>
        </div>
      </div>
    </mat-toolbar>
  `,
  styles: [`
    .header-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      height: 64px;
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .menu-button {
      display: none;
    }

    .logo-link {
      text-decoration: none;
      color: inherit;
    }

    .app-title {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .header-nav {
      display: flex;
      gap: 24px;
    }

    .nav-link {
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      font-weight: 500;
      padding: 8px 16px;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-link:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
    }

    .nav-link.active {
      color: white;
      background-color: rgba(255, 255, 255, 0.2);
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-button {
      margin-left: 8px;
    }

    .user-menu {
      min-width: 200px;
    }

    .user-info {
      padding: 16px;
      background-color: #f5f5f5;
    }

    .user-name {
      font-weight: 500;
      font-size: 14px;
      color: #333;
    }

    .user-email {
      font-size: 12px;
      color: #666;
      margin-top: 2px;
    }

    .menu-icon {
      margin-left: 8px;
    }

    .logout-button {
      color: #f44336;
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .header-nav {
        display: none;
      }

      .menu-button {
        display: block;
      }

      .header-content {
        padding: 0 8px;
      }

      .app-title {
        font-size: 18px;
      }
    }

    @media (max-width: 480px) {
      .header-right {
        gap: 4px;
      }

      .user-button {
        margin-left: 4px;
      }
    }
  `]
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private signalRService = inject(SignalRService);
  
  private subscription = new Subscription();
  
  currentUser: any = null;

  ngOnInit() {
    // الاشتراك في بيانات المستخدم الحالي
    this.subscription.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
      })
    );

    // بدء SignalR connection عند تسجيل الدخول
    if (this.authService.isLoggedIn()) {
      this.signalRService.startConnection();
    }
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  toggleSidebar() {
    // يمكن إضافة منطق toggle sidebar هنا
    console.log('Toggle sidebar');
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        // إيقاف SignalR connection
        this.signalRService.stopConnection();
        // إعادة توجيه إلى صفحة تسجيل الدخول
        window.location.href = '/auth/login';
      },
      error: (error) => {
        console.error('Error during logout:', error);
      }
    });
  }
}
