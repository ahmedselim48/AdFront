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
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Chart.js
// import { NgChartsModule } from 'ng2-charts'; // TODO: Install ng2-charts when needed

// Components
import { AdminComponent } from './admin.component';
import { AdminDashboardComponent } from './components/admin-dashboard/admin-dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdManagementComponent } from './components/ad-management/ad-management.component';
import { CategoryManagementComponent } from './components/category-management/category-management.component';
import { ReportsComponent } from './components/reports/reports.component';
// TODO: Add other admin components when needed
// import { AdminStatsComponent } from './components/admin-stats/admin-stats.component';
// import { AdminNotificationsComponent } from './components/admin-notifications/admin-notifications.component';

// Services
import { AdminService } from '../../core/services/admin.service';
import { StatisticsService } from '../../core/services/statistics.service';
import { CategoryManagementService } from '../../core/services/category-management.service';
import { NotificationsService } from '../../core/services/notifications.service';

const ADMIN_ROUTES = [
  {
          path: '',
          component: AdminComponent,
          children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full' as const
      },
      {
        path: 'dashboard',
        component: AdminDashboardComponent
      },
      {
        path: 'users',
        component: UserManagementComponent
      },
      {
        path: 'ads',
        component: AdManagementComponent
      },
      {
        path: 'categories',
        component: CategoryManagementComponent
      },
      {
        path: 'reports',
        component: ReportsComponent
      },
      // TODO: Add routes when components are created
      // {
      //   path: 'notifications',
      //   component: AdminNotificationsComponent
      // }
    ]
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(ADMIN_ROUTES),
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
    MatMenuModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatBadgeModule,
    MatProgressBarModule,
    // NgChartsModule // TODO: Install ng2-charts when needed
  ],
        providers: [
          AdminService,
          StatisticsService,
          CategoryManagementService,
          NotificationsService
        ]
})
export class AdminModule { }
