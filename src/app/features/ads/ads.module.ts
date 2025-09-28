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
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatExpansionModule } from '@angular/material/expansion';

// Components
import { AdsListComponent } from './components/ads-list/ads-list.component';
import { AdCreateComponent } from './components/ad-create/ad-create.component';
import { AdEditComponent } from './components/ad-edit/ad-edit.component';
import { AdDetailsComponent } from './components/ad-details/ad-details.component';
// TODO: Add other ad components when needed
// import { AdCardComponent } from './components/ad-card/ad-card.component';
// import { AdFiltersComponent } from './components/ad-filters/ad-filters.component';
// import { ImageUploadComponent } from './components/image-upload/image-upload.component';
// import { AIGenerateComponent } from './components/ai-generate/ai-generate.component';

// Services
import { AdsService } from '../../core/services/ads.service';
import { CategoriesService } from '../../core/services/categories.service';

const ADS_ROUTES = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full' as const
  },
  {
    path: 'list',
    component: AdsListComponent
  },
  {
    path: 'create',
    component: AdCreateComponent
  },
  {
    path: 'edit/:id',
    component: AdEditComponent
  },
  {
    path: 'details/:id',
    component: AdDetailsComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule.forChild(ADS_ROUTES),
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatStepperModule,
    MatSelectModule,
    MatCheckboxModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatProgressBarModule,
    MatDividerModule,
    MatGridListModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatExpansionModule
  ],
  providers: [
    AdsService,
    CategoriesService
  ]
})
export class AdsModule { }
