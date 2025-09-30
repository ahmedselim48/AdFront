import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

// Import components statically to avoid dynamic import issues
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/components/login/login.component';
import { RegisterComponent } from './features/auth/components/register/register.component';
import { ResetPasswordComponent } from './features/auth/components/reset-password/reset-password.component';
import { VerifyEmailComponent as ConfirmEmailComponent } from './features/auth/components/verify-email/verify-email.component';
import { ForgotPasswordComponent } from './features/auth/components/forgot-password/forgot-password.component';
import { VerifyEmailComponent } from './features/auth/components/verify-email/verify-email.component';
import { ResendConfirmationComponent } from './features/auth/components/resend-confirmation/resend-confirmation.component';
import { ChangePasswordComponent } from './features/auth/components/change-password/change-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdsComponent } from './features/ads/ads.component';
import { AdsListComponent } from './features/ads-list/ads-list.component';
import { SmartRepliesComponent } from './features/smart-replies/smart-replies.component';
import { CompetitionComponent } from './features/competition/competition.component';
import { ReportsComponent } from './features/reports/reports.component';
import { NotificationsComponent } from './features/notifications/notifications.component';
import { ChatListComponent } from './features/chat/chat-list.component';
import { TemplatesComponent } from './features/chat/templates.component';
import { ChatMessagesComponent } from './features/chat/chat-messages.component';
import { DirectChatListComponent } from './features/direct-chat/direct-chat-list.component';
import { DirectChatMessagesComponent } from './features/direct-chat/direct-chat-messages.component';
import { ProfileComponent } from './features/profile/profile.component';
import { ProfileManagementComponent } from './features/profile/profile-management.component';
import { AdCreateComponent } from './features/ad-create/ad-create.component';

// Import Additional Components
import { AboutComponent } from './features/about/about.component';
import { HelpComponent } from './features/help/help.component';
import { SettingsComponent } from './features/settings/settings.component';
import { SubscriptionComponent } from './features/payments/subscription.component';
import { PrivacyComponent } from './features/legal/privacy.component';
import { TermsComponent } from './features/legal/terms.component';

// Import Profile Components
import { AccountSettingsComponent } from './features/profile/components/account-settings/account-settings.component';
import { NotificationSettingsComponent } from './features/profile/components/notification-settings/notification-settings.component';
import { PrivacySettingsComponent } from './features/profile/components/privacy-settings/privacy-settings.component';
import { ProfileSettingsComponent } from './features/profile/components/profile-settings/profile-settings.component';
import { ProfilePictureComponent } from './features/profile/components/profile-picture/profile-picture.component';
import { SecuritySettingsComponent } from './features/profile/components/security-settings/security-settings.component';
import { SubscriptionSettingsComponent } from './features/profile/components/subscription-settings/subscription-settings.component';

// Import Admin Components
import { AdminComponent } from './features/admin/admin.component';
import { AdminDashboardComponent } from './features/admin/components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './features/admin/components/user-management/user-management.component';
import { AdManagementComponent } from './features/admin/components/ad-management/ad-management.component';
import { CategoryManagementComponent } from './features/admin/components/category-management/category-management.component';
import { ReportsComponent as AdminReportsComponent } from './features/admin/components/reports/reports.component';
import { inject } from '@angular/core';
import { AuthService } from './core/auth/auth.service';
import { Router } from '@angular/router';
// Removed duplicate admin component import

export const routes: Routes = [
  // Redirect root to home
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  
  // Public Routes
  { path: 'home', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'help', component: HelpComponent },
  { path: 'settings', component: SettingsComponent },
  
  // Authentication routes - All auth routes available without restrictions for testing
  { path: 'auth', children: [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'confirm-email', component: ConfirmEmailComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'resend-confirmation', component: ResendConfirmationComponent },
    { path: 'change-password', component: ChangePasswordComponent }
  ]},
  
  // Ads & Content Routes - Available without auth for testing
  { path: 'ads', component: AdsComponent },
  { path: 'ads/list', component: AdsListComponent },
  { path: 'ads/create', component: AdCreateComponent },
  { path: 'ads/create', redirectTo: 'ads/create', pathMatch: 'full' }, // For backward compatibility
  { path: 'adscreate', redirectTo: 'ads/create', pathMatch: 'full' }, // Alternative route
  
  // Legal & Policy Routes
  { path: 'privacy', component: PrivacyComponent },
  { path: 'terms', component: TermsComponent },
  
  // Payment & Subscription Routes
  { path: 'subscription', component: SubscriptionComponent },
  { path: 'payments', redirectTo: 'subscription', pathMatch: 'full' },
  
  // Dashboard & Analytics - Available without auth for testing
  { path: 'dashboard', component: DashboardComponent },
  { path: 'smart-replies', component: SmartRepliesComponent },
  { path: 'competition', component: CompetitionComponent },
  { path: 'reports', component: ReportsComponent },
  { path: 'notifications', component: NotificationsComponent },
  
  // Chat & Communication - Available without auth for testing
  { path: 'chat', children: [
    { path: '', component: ChatListComponent },
    { path: 'templates', component: TemplatesComponent },
    { path: ':id', component: ChatMessagesComponent }
  ] },
  
  { path: 'direct-chat', children: [
    { path: '', component: DirectChatListComponent },
    { path: ':id', component: DirectChatMessagesComponent }
  ] },
  
  // Profile Management - Redirect admins to dashboard
  { path: 'profile', canActivate: [() => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.getCurrentUser();
    const isAdmin = Array.isArray(user?.roles) && user!.roles.includes('Admin');
    if (isAdmin) { router.navigateByUrl('/admin/dashboard'); return false; }
    return true;
  }], children: [
    { path: '', component: ProfileComponent },
    { path: 'management', component: ProfileManagementComponent },
    { path: 'settings', redirectTo: 'profile-settings', pathMatch: 'full' },
    { path: 'account', redirectTo: 'account-settings', pathMatch: 'full' },
    { path: 'privacy', redirectTo: 'privacy-settings', pathMatch: 'full' },
    { path: 'notifications', redirectTo: 'notification-settings', pathMatch: 'full' },
    { path: 'security', redirectTo: 'security-settings', pathMatch: 'full' },
    { path: 'subscription', redirectTo: 'subscription-settings', pathMatch: 'full' },
    // Actual settings routes
    { path: 'account-settings', component: AccountSettingsComponent },
    { path: 'notification-settings', component: NotificationSettingsComponent },
    { path: 'privacy-settings', component: PrivacySettingsComponent },
    { path: 'profile-settings', component: ProfileSettingsComponent },
    { path: 'profile-picture', component: ProfilePictureComponent },
    { path: 'security-settings', component: SecuritySettingsComponent },
    { path: 'subscription-settings', component: SubscriptionSettingsComponent }
  ] },
  
  // Admin Management - Available without auth for testing
  { path: 'admin', component: AdminComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: AdminDashboardComponent },
    { path: 'users', component: UserManagementComponent },
    { path: 'ads', component: AdManagementComponent },
    { path: 'categories', component: CategoryManagementComponent },
    { path: 'reports', component: AdminReportsComponent },
    { path: 'notifications', component: AdminComponent }
  ] },
  
  // Additional Routes for better navigation
  { path: 'legal', children: [
    { path: '', redirectTo: 'privacy', pathMatch: 'full' },
    { path: 'privacy', component: PrivacyComponent },
    { path: 'terms', component: TermsComponent }
  ] },
  
  // Alternative routes for common pages
  { path: 'contact', redirectTo: 'help', pathMatch: 'full' },
  { path: 'support', redirectTo: 'help', pathMatch: 'full' },
  { path: 'faq', redirectTo: 'help', pathMatch: 'full' },
  { path: 'guide', redirectTo: 'help', pathMatch: 'full' },
  
  // Wildcard route - redirect to home for any unmatched routes
  { path: '**', redirectTo: 'home' }
];

