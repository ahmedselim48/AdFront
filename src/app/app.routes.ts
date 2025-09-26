import { Routes } from '@angular/router';
import { AuthGuard, GuestGuard } from './core/auth/auth.guard';
import { adminGuard } from './core/auth/admin.guard';

// Import components statically to avoid dynamic import issues
import { HomeComponent } from './features/home/home.component';
import { LoginComponent } from './features/auth/login.component';
import { RegisterComponent } from './features/auth/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password.component';
import { VerifyEmailComponent } from './features/auth/verify-email.component';
import { ResendConfirmationComponent } from './features/auth/resend-confirmation.component';
import { ChangePasswordComponent } from './features/auth/change-password.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { AdsComponent } from './features/ads/ads.component';
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
import { AdminComponent } from './features/admin/admin.component';
import { AdCreateComponent } from './features/ad-create/ad-create.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomeComponent },
  { path: 'auth', children: [
    { path: 'login', canActivate: [GuestGuard], component: LoginComponent },
    { path: 'register', canActivate: [GuestGuard], component: RegisterComponent },
    { path: 'forgot', canActivate: [GuestGuard], component: ForgotPasswordComponent },
    { path: 'reset', canActivate: [GuestGuard], component: ResetPasswordComponent },
    { path: 'verify-email', canActivate: [GuestGuard], component: VerifyEmailComponent },
    { path: 'resend-confirmation', canActivate: [GuestGuard], component: ResendConfirmationComponent },
    { path: 'change-password', canActivate: [AuthGuard], component: ChangePasswordComponent },
  ]},
  { path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent },
  { path: 'ads', component: AdsComponent },
  { path: 'adscreate', component: AdCreateComponent },
  { path: 'smart-replies', canActivate: [AuthGuard], component: SmartRepliesComponent },
  { path: 'competition', canActivate: [AuthGuard], component: CompetitionComponent },
  { path: 'reports', canActivate: [AuthGuard], component: ReportsComponent },
  { path: 'notifications', canActivate: [AuthGuard], component: NotificationsComponent },
  { path: 'chat', canActivate: [AuthGuard], children: [
    { path: '', component: ChatListComponent },
    { path: 'templates', component: TemplatesComponent },
    { path: ':id', component: ChatMessagesComponent },
  ] },
  { path: 'direct-chat', canActivate: [AuthGuard], children: [
    { path: '', component: DirectChatListComponent },
    { path: ':id', component: DirectChatMessagesComponent },
  ] },
  { path: 'profile', component: ProfileComponent },
  { path: 'admin', canActivate: [AuthGuard, adminGuard], component: AdminComponent },
  { path: '**', redirectTo: 'home' }
];
