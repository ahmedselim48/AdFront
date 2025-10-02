import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Material Modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';

// Lucide Icons
import { LucideAngularModule } from 'lucide-angular';

// Components
import { ProfileComponent } from './profile.component';
import { ProfilePictureComponent } from './components/profile-picture/profile-picture.component';
import { ProfileSettingsComponent } from './components/profile-settings/profile-settings.component';
import { ProfileDashboardComponent } from './components/profile-dashboard/profile-dashboard.component';

// Shared Components
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner.component';

// Routes - These are now handled in app.routes.ts
// This module only provides the components
const routes: Routes = [];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    
    // Material Modules
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatDividerModule,
    MatChipsModule,
    MatBadgeModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    
    // Lucide Icons
    LucideAngularModule,
    
    // Shared Components
    LoadingSpinnerComponent,
    
    // Standalone Components
    ProfileComponent,
    ProfilePictureComponent,
    ProfileSettingsComponent,
    ProfileDashboardComponent
  ]
})
export class ProfileModule { }