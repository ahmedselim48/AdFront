import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { I18nService } from './core/services/i18n.service';
import { ChatService } from './core/services/chat.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private i18n = inject(I18nService);
  private chat = inject(ChatService);
  currentYear = new Date().getFullYear();
  mobileOpen = false;
  unreadCount = 0;
  constructor(){
    this.pollUnread();
  }
  private pollUnread(){
    const run = () => this.chat.unreadCount().subscribe({ next: r => this.unreadCount = r.count, error: () => {} });
    run();
    setInterval(run, 30000);
  }
  toggleMenu(){ this.mobileOpen = !this.mobileOpen; }
  closeMenu(){ this.mobileOpen = false; }

  toggleLang(){ this.i18n.toggle(); }
  get langLabel(){ return this.i18n.current === 'ar' ? 'EN' : 'AR'; }

  
}
