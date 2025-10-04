import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, filter } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { UserProfile } from '../../../models/auth.models';
import { NotificationService } from '../../../core/services/notification.service';
import { NotificationDto } from '../../../models/notification.model';
import { 
  LucideAngularModule,
  Home, 
  User, 
  Plus, 
  Bell, 
  Settings, 
  BarChart3, 
  MessageCircle, 
  TrendingUp, 
  Users, 
  Shield, 
  LogOut,
  Menu,
  X,
  Search,
  Filter
} from 'lucide-angular';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  template: `
    <div class="layout-container">
      <!-- Mobile Header -->
      <nav class="navbar navbar-expand-lg navbar-dark bg-primary d-lg-none">
        <div class="container-fluid">
          <a class="navbar-brand fw-bold" routerLink="/home">
            <i class="bi bi-house-door me-2"></i>
            HarajAI
          </a>
          <button 
            class="navbar-toggler" 
            type="button" 
            (click)="toggleMobileMenu()"
            [attr.aria-expanded]="isMobileMenuOpen"
            aria-controls="mobileMenu"
            aria-label="Toggle navigation">
            <lucide-icon [name]="isMobileMenuOpen ? 'x' : 'menu'" size="24"></lucide-icon>
          </button>
        </div>
      </nav>

      <!-- Mobile Menu -->
      <div class="mobile-menu d-lg-none" [class.show]="isMobileMenuOpen" id="mobileMenu">
        <div class="mobile-menu-content">
          <div class="mobile-menu-header">
            <h5 class="mb-0">القائمة</h5>
            <button class="btn-close" (click)="closeMobileMenu()"></button>
          </div>
          <div class="mobile-menu-body">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link" routerLink="/home" (click)="closeMobileMenu()">
                  <lucide-icon name="home" size="20" class="me-2"></lucide-icon>
                  الرئيسية
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ads" (click)="closeMobileMenu()">
                  <lucide-icon name="trending-up" size="20" class="me-2"></lucide-icon>
                  الإعلانات
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/chat" (click)="closeMobileMenu()" *ngIf="isLoggedIn">
                  <lucide-icon name="message-circle" size="20" class="me-2"></lucide-icon>
                  المحادثات
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/admin" (click)="closeMobileMenu()" *ngIf="isAdmin">
                  <lucide-icon name="shield" size="20" class="me-2"></lucide-icon>
                  الإدارة
                </a>
              </li>
            </ul>
          </div>
          <div class="mobile-menu-footer" *ngIf="isLoggedIn">
            <div class="user-info">
              <div class="user-avatar">
                <lucide-icon name="user" size="24"></lucide-icon>
              </div>
              <div class="user-details">
                <div class="user-name">{{ currentUser?.fullName || 'المستخدم' }}</div>
                <div class="user-email">{{ currentUser?.email }}</div>
              </div>
            </div>
            <button class="btn btn-outline-danger btn-sm" (click)="logout()">
              <lucide-icon name="log-out" size="16" class="me-1"></lucide-icon>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>

      <!-- Desktop Layout -->
      <div class="desktop-layout d-none d-lg-flex">
        <!-- Sidebar -->
        <aside class="sidebar">
          <div class="sidebar-header">
            <a class="navbar-brand fw-bold" routerLink="/home">
              <i class="bi bi-house-door me-2"></i>
              HarajAI
            </a>
          </div>
          <nav class="sidebar-nav">
            <ul class="nav flex-column">
              <li class="nav-item">
                <a class="nav-link" routerLink="/home" routerLinkActive="active">
                  <lucide-icon name="home" size="20" class="me-2"></lucide-icon>
                  الرئيسية
                </a>
              </li>
              <li class="nav-item">
                <a class="nav-link" routerLink="/ads" routerLinkActive="active">
                  <lucide-icon name="trending-up" size="20" class="me-2"></lucide-icon>
                  الإعلانات
                </a>
              </li>
              <li class="nav-item" *ngIf="isLoggedIn">
                <a class="nav-link" routerLink="/chat" routerLinkActive="active">
                  <lucide-icon name="message-circle" size="20" class="me-2"></lucide-icon>
                  المحادثات
                </a>
              </li>
              <li class="nav-item" *ngIf="isAdmin">
                <a class="nav-link" routerLink="/admin" routerLinkActive="active">
                  <lucide-icon name="shield" size="20" class="me-2"></lucide-icon>
                  الإدارة
                </a>
              </li>
            </ul>
          </nav>
        </aside>

        <!-- Main Content -->
        <main class="main-content">
          <!-- Top Bar -->
          <header class="top-bar">
            <div class="top-bar-left">
              <div class="search-box">
                <lucide-icon name="search" size="20" class="search-icon"></lucide-icon>
                <input type="text" class="form-control" placeholder="البحث في الإعلانات..." [(ngModel)]="searchQuery">
                <button class="btn btn-outline-secondary" (click)="performSearch()">
                  <lucide-icon name="filter" size="16"></lucide-icon>
                </button>
              </div>
            </div>
            <div class="top-bar-right">
              <button class="btn btn-primary" routerLink="/ads/create" *ngIf="isLoggedIn">
                <lucide-icon name="plus" size="16" class="me-1"></lucide-icon>
                إعلان جديد
              </button>
              <div class="user-menu" *ngIf="isLoggedIn">
                <div class="dropdown">
                  <button class="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <lucide-icon name="user" size="16" class="me-1"></lucide-icon>
                    {{ currentUser?.fullName || 'المستخدم' }}
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end">
                    <li><a class="dropdown-item" routerLink="/profile">
                      <lucide-icon name="settings" size="16" class="me-2"></lucide-icon>
                      الملف الشخصي
                    </a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" (click)="logout()">
                      <lucide-icon name="log-out" size="16" class="me-2"></lucide-icon>
                      تسجيل الخروج
                    </a></li>
                  </ul>
                </div>
              </div>
              <div class="auth-buttons" *ngIf="!isLoggedIn">
                <a class="btn btn-outline-primary me-2" routerLink="/auth/login">تسجيل الدخول</a>
                <a class="btn btn-primary" routerLink="/auth/register">إنشاء حساب</a>
              </div>
            </div>
          </header>

          <!-- Page Content -->
          <div class="page-content">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>

      <!-- Mobile Content -->
      <main class="mobile-content d-lg-none">
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .layout-container {
      min-height: 100vh;
      background-color: #f8f9fa;
    }

    .mobile-menu {
      position: fixed;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 1050;
      transition: left 0.3s ease;
    }

    .mobile-menu.show {
      left: 0;
    }

    .mobile-menu-content {
      position: absolute;
      top: 0;
      right: 0;
      width: 280px;
      height: 100vh;
      background-color: white;
      box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
    }

    .mobile-menu-header {
      padding: 1rem;
      border-bottom: 1px solid #dee2e6;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .mobile-menu-body {
      padding: 1rem;
      flex: 1;
    }

    .mobile-menu-footer {
      padding: 1rem;
      border-top: 1px solid #dee2e6;
    }

    .user-info {
      display: flex;
      align-items: center;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background-color: #e9ecef;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .user-email {
      font-size: 0.875rem;
      color: #6c757d;
    }

    .desktop-layout {
      min-height: 100vh;
    }

    .sidebar {
      width: 250px;
      background-color: #2c3e50;
      color: white;
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      overflow-y: auto;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 1.5rem 1rem;
      border-bottom: 1px solid #34495e;
    }

    .sidebar-nav {
      padding: 1rem 0;
    }

    .sidebar .nav-link {
      color: #bdc3c7;
      padding: 0.75rem 1.5rem;
      border-radius: 0;
      transition: all 0.3s ease;
    }

    .sidebar .nav-link:hover {
      background-color: #34495e;
      color: white;
    }

    .sidebar .nav-link.active {
      background-color: #3498db;
      color: white;
    }

    .main-content {
      margin-left: 250px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .top-bar {
      background-color: white;
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .search-box {
      position: relative;
      width: 400px;
    }

    .search-icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: #6c757d;
    }

    .search-box input {
      padding-right: 40px;
      padding-left: 40px;
    }

    .top-bar-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .page-content {
      flex: 1;
      padding: 2rem;
    }

    .mobile-content {
      padding-top: 60px;
    }

    .mobile-content .page-content {
      padding: 1rem;
    }

    @media (max-width: 991.98px) {
      .main-content {
        margin-left: 0;
      }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private notificationsService = inject(NotificationService);
  private router = inject(Router);
  private destroy$ = new Subject<void>();

  currentUser: UserProfile | null = null;
  isLoggedIn = false;
  isAdmin = false;
  unreadCount = 0;
  isMobileMenuOpen = false;
  searchQuery = '';

  ngOnInit() {
    // Subscribe to auth state
    this.authService.currentUser$.pipe(
      takeUntil(this.destroy$)
    ).subscribe(user => {
      this.currentUser = user;
      this.isLoggedIn = !!user;
      this.isAdmin = user?.roles?.includes('Admin') || false;
    });

    // Subscribe to notifications count
    this.notificationsService.unreadCount$.pipe(
      takeUntil(this.destroy$)
    ).subscribe((count: number) => {
      this.unreadCount = count;
    });

    // Load notifications count
    if (this.isLoggedIn) {
      this.loadUnreadCount();
    }

    // Close mobile menu on route change
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.closeMobileMenu();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: () => {
        // Even if logout fails on server, clear local state
        this.authService.logoutLocal();
        this.router.navigate(['/home']);
      }
    });
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/ads'], { 
        queryParams: { search: this.searchQuery.trim() } 
      });
    }
  }

  private loadUnreadCount() {
    // Load notifications to get unread count
    this.notificationsService.getUnreadCount().subscribe({
      next: (count: number) => {
        this.unreadCount = count;
      },
      error: () => {
        // Ignore errors for notifications count
      }
    });
  }
}
