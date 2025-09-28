import { Routes } from '@angular/router';

export const routes: Routes = [
  // Default route
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Dashboard
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },

  // Authentication routes
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },

  // Ads routes
  {
    path: 'ads',
    loadChildren: () => import('./features/ads/ads.module').then(m => m.AdsModule)
  },

  // Profile routes
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfileModule)
  },

  // Admin routes
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module').then(m => m.AdminModule)
  },

  // Notifications
  {
    path: 'notifications',
    loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
  },

  // Messages/Chat
  {
    path: 'messages',
    loadComponent: () => import('./features/chat/chat.component').then(m => m.ChatComponent)
  },

  // Competition Analysis
  {
    path: 'competition',
    loadComponent: () => import('./features/competition/competition.component').then(m => m.CompetitionComponent)
  },

  // Payments/Subscription
  {
    path: 'subscription',
    loadComponent: () => import('./features/payments/subscription.component').then(m => m.SubscriptionComponent)
  },

  // Settings
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings.component').then(m => m.SettingsComponent)
  },

  // Help/Support
  {
    path: 'help',
    loadComponent: () => import('./features/help/help.component').then(m => m.HelpComponent)
  },

  // About
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then(m => m.AboutComponent)
  },

  // Privacy Policy
  {
    path: 'privacy',
    loadComponent: () => import('./features/legal/privacy.component').then(m => m.PrivacyComponent)
  },

  // Terms of Service
  {
    path: 'terms',
    loadComponent: () => import('./features/legal/terms.component').then(m => m.TermsComponent)
  },

  // 404 - Page not found
  {
    path: '**',
    loadComponent: () => import('./shared/components/page-not-found/page-not-found.component').then(m => m.PageNotFoundComponent)
  }
];