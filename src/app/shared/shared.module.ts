import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
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

// Shared Components
import { LayoutComponent } from './components/layout/layout.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from './components/error-message/error-message.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { SearchComponent } from './components/search/search.component';
import { CardComponent } from './components/card/card.component';
import { ModalComponent } from './components/modal/modal.component';
import { ToastComponent } from './components/toast/toast.component';

// Pipes
import { SafeHtmlPipe } from './pipes/safe-html.pipe';
import { TruncatePipe } from './pipes/truncate.pipe';
import { TimeAgoPipe } from './pipes/time-ago.pipe';
import { CurrencyPipe } from './pipes/currency.pipe';

// Directives
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { DebounceDirective } from './directives/debounce.directive';
import { LazyLoadDirective } from './directives/lazy-load.directive';

const SHARED_COMPONENTS = [
  LayoutComponent,
  LoadingSpinnerComponent,
  ErrorMessageComponent,
  PaginationComponent,
  SearchComponent,
  CardComponent,
  ModalComponent,
  ToastComponent
];

const SHARED_PIPES = [
  SafeHtmlPipe,
  TruncatePipe,
  TimeAgoPipe,
  CurrencyPipe
];

const SHARED_DIRECTIVES = [
  ClickOutsideDirective,
  DebounceDirective,
  LazyLoadDirective
];

const ANGULAR_MATERIAL_MODULES = [
  MatButtonModule,
  MatCardModule,
  MatInputModule,
  MatFormFieldModule,
  MatIconModule,
  MatProgressSpinnerModule,
  MatDialogModule,
  MatSnackBarModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatMenuModule,
  MatBadgeModule,
  MatChipsModule,
  MatTooltipModule,
  MatTabsModule,
  MatExpansionModule,
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
  MatSortModule
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...ANGULAR_MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES,
    ...SHARED_DIRECTIVES
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    ...ANGULAR_MATERIAL_MODULES,
    ...SHARED_COMPONENTS,
    ...SHARED_PIPES,
    ...SHARED_DIRECTIVES
  ]
})
export class SharedModule { }
