import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { TranslatePipe } from './shared/pipes/translate.pipe';
import { I18nService } from './core/services/i18n.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent, TranslatePipe],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private i18n = inject(I18nService);
  currentYear = new Date().getFullYear();
  mobileOpen = false;
  toggleMenu(){ this.mobileOpen = !this.mobileOpen; }
  closeMenu(){ this.mobileOpen = false; }

  toggleLang(){ this.i18n.toggle(); }
  get langLabel(){ return this.i18n.current === 'ar' ? 'EN' : 'AR'; }
}
