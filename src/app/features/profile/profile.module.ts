import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

// Components
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { AccountSettingsComponent } from './components/account-settings/account-settings.component';
import { PrivacySettingsComponent } from './components/privacy-settings/privacy-settings.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { SecuritySettingsComponent } from './components/security-settings/security-settings.component';
import { SubscriptionSettingsComponent } from './components/subscription-settings/subscription-settings.component';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';

// Services
import { AuthService } from '../../core/auth/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { PaymentsService } from '../../core/services/payments.service';

const PROFILE_ROUTES = [
  {
    path: '',
    component: ProfileComponent,
    children: [
      {
        path: '',
        redirectTo: 'settings',
        pathMatch: 'full' as const
      },
      {
        path: 'settings',
        component: ProfileSettingsComponent
      },
      {
        path: 'account',
        component: AccountSettingsComponent
      },
      {
        path: 'privacy',
        component: PrivacySettingsComponent
      },
      {
        path: 'notifications',
        component: NotificationSettingsComponent
      },
      {
        path: 'security',
        component: SecuritySettingsComponent
      },
      {
        path: 'subscription',
        component: SubscriptionSettingsComponent
      }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(PROFILE_ROUTES),
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDialogModule,
    MatChipsModule,
    MatMenuModule
  ],
  providers: [
    AuthService,
    NotificationsService,
    PaymentsService
  ]
})
export class ProfileModule { }
