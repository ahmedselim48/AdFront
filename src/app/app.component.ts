import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
// import { ToastComponent } from './shared/components/toast/toast.component'; // TODO: Use when needed
import { I18nService } from './core/services/i18n.service';
import { ChatService } from './core/services/chat.service';
import { TokenStorageService } from './core/auth/token-storage.service';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { LucideAngularModule } from 'lucide-angular';
import { environment } from '../environments/environment';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, NotificationComponent, FormsModule, LucideAngularModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private i18n = inject(I18nService);
  private chat = inject(ChatService);
  protected storage = inject(TokenStorageService);
  private auth = inject(AuthService);
  private router = inject(Router);
  currentYear = new Date().getFullYear();
  mobileOpen = false;
  unreadCount = 0;
  currentUser: any = null;
  dropdownOpen = false;
  showUserMenu = false;
  searchQuery = '';
  imageLoadFailed = false;
  constructor(){
    // Initialize authentication state from stored tokens
    this.auth.initializeAuth();
    this.loadCurrentUser();
    this.pollUnread();
  }
  get isAdmin(): boolean {
    const roles: string[] | undefined = this.currentUser?.roles;
    return Array.isArray(roles) && roles.includes('Admin');
  }

  get greeting(): string {
    if (!this.currentUser) return '';
    return this.isAdmin
      ? 'Welcome admin'
      : (this.currentUser?.userName || this.currentUser?.fullName || this.currentUser?.email || 'User');
  }

  get avatarUrl(): string | null {
    if (this.isAdmin) return null;
    const raw = this.currentUser?.profileImageUrl || this.currentUser?.profilePicture;
    if (!raw) return null;
    if (/^https?:\/\//i.test(raw)) return raw;
    // Strip '/api' if apiBaseUrl points to the API route; static files are served from the site root
    const baseOrigin = (environment.apiBaseUrl || '').replace(/\/$/, '').replace(/\/api$/, '');
    const path = raw.startsWith('/') ? raw : `/${raw}`;
    return `${baseOrigin}${path}`;
  }
  private loadCurrentUser() {
    // Set initial user state
    this.currentUser = this.auth.getCurrentUser();
    
    // Subscribe to user changes
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
      console.log('Current user updated:', user);
    });
  }

  private pollUnread(){
    const run = () => {
      if (!this.storage.accessToken) { this.unreadCount = 0; return; }
      // TODO: Implement unread count when ChatService is ready
      this.unreadCount = 0;
    };
    run();
    setInterval(run, 30000);
  }
  toggleMenu(){ this.mobileOpen = !this.mobileOpen; }
  closeMenu(){ this.mobileOpen = false; }

  toggleDropdown(){ this.dropdownOpen = !this.dropdownOpen; }
  closeDropdown(){ this.dropdownOpen = false; }

  toggleUserMenu(){ this.showUserMenu = !this.showUserMenu; }
  closeUserMenu(){ this.showUserMenu = false; }

  toggleLang(){ this.i18n.toggle(); }
  get langLabel(){ return this.i18n.current === 'ar' ? 'EN' : 'AR'; }

  onSearch(){
    if (this.searchQuery.trim()) {
      this.router.navigate(['/ads'], { queryParams: { search: this.searchQuery } });
    }
  }

  logout(){
    this.auth.logout().subscribe({
      next: () => {
        console.log('Logout successful');
        // Clear all local data
        this.auth.clearLocalData();
        this.router.navigateByUrl('/home');
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Even if logout fails on server, clear local data
        this.auth.clearLocalData();
        this.router.navigateByUrl('/home');
      }
    });
  }
}
