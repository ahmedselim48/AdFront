import { Routes } from '@angular/router';
// import { authGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'auth', children: [
    { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
    { path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
    { path: 'forgot', loadComponent: () => import('./features/auth/forgot-password.component').then(m => m.ForgotPasswordComponent) },
    { path: 'reset', loadComponent: () => import('./features/auth/reset-password.component').then(m => m.ResetPasswordComponent) },
  ]},
  // { path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  // { path: 'ads', canActivate: [authGuard], loadComponent: () => import('./features/ads/ads.component').then(m => m.AdsComponent) },
  { path: 'ads', loadComponent: () => import('./features/ads/ads.component').then(m => m.AdsComponent) },
  // { path: 'smart-replies', canActivate: [authGuard], loadComponent: () => import('./features/smart-replies/smart-replies.component').then(m => m.SmartRepliesComponent) },
  { path: 'smart-replies', loadComponent: () => import('./features/smart-replies/smart-replies.component').then(m => m.SmartRepliesComponent) },
  // { path: 'competition', canActivate: [authGuard], loadComponent: () => import('./features/competition/competition.component').then(m => m.CompetitionComponent) },
  { path: 'competition', loadComponent: () => import('./features/competition/competition.component').then(m => m.CompetitionComponent) },
  // { path: 'reports', canActivate: [authGuard], loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
  { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
  // { path: 'notifications', canActivate: [authGuard], loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
  { path: 'notifications', loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent) },
  // { path: 'chat', canActivate: [authGuard], children: [
  { path: 'chat', children: [
    { path: '', loadComponent: () => import('./features/chat/chat-list.component').then(m => m.ChatListComponent) },
    { path: 'templates', loadComponent: () => import('./features/chat/templates.component').then(m => m.TemplatesComponent) },
    { path: ':id', loadComponent: () => import('./features/chat/chat-messages.component').then(m => m.ChatMessagesComponent) },
  ] },
  // { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'profile', loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
  // { path: 'admin', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: 'admin', loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
  { path: '**', redirectTo: 'home' }
];
