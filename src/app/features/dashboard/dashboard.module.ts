import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';

// Chart.js - Commented out due to static analysis issue
// import { NgChartsModule } from 'ng2-charts';

// Components
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { StatsOverviewComponent } from './components/stats-overview/stats-overview.component';
import { RecentActivityComponent } from './components/recent-activity/recent-activity.component';
import { PerformanceChartComponent } from './components/performance-chart/performance-chart.component';
import { QuickActionsComponent } from './components/quick-actions/quick-actions.component';
import { NotificationsWidgetComponent } from './components/notifications-widget/notifications-widget.component';
import { SubscriptionStatusComponent } from './components/subscription-status/subscription-status.component';

// Services
import { AdsService } from '../../core/services/ads.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { AuthService } from '../../core/auth/auth.service';

const DASHBOARD_ROUTES = [
  {
    path: '',
    component: DashboardComponent
  }
];

@NgModule({
  declarations: [
    // All components are standalone, so no declarations needed
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(DASHBOARD_ROUTES),
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatGridListModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDividerModule
    // NgChartsModule - Commented out due to static analysis issue
  ],
  providers: [
    AdsService,
    NotificationsService,
    AuthService
  ]
})
export class DashboardModule { }
