import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
// import { ToastComponent } from './shared/components/toast/toast.component'; // TODO: Use when needed
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { I18nService } from './core/services/i18n.service';
import { ChatService } from './core/services/chat.service';
import { TokenStorageService } from './core/auth/token-storage.service';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
import { NotificationComponent } from './shared/components/notification/notification.component';


@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe, NotificationComponent],
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
  constructor(){
    // Initialize authentication state from stored tokens
    this.auth.initializeAuth();
    this.pollUnread();
    this.loadCurrentUser();
  }
  private loadCurrentUser() {
    this.auth.currentUser$.subscribe(user => {
      this.currentUser = user;
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

  toggleLang(){ this.i18n.toggle(); }
  get langLabel(){ return this.i18n.current === 'ar' ? 'EN' : 'AR'; }

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
