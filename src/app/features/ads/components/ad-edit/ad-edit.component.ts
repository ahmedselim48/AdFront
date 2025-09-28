import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatStepperModule } from '@angular/material/stepper';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { LucideAngularModule, Upload, Image, Zap, Eye, Save, ArrowLeft, ArrowRight, X, Plus, Trash2 } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../../core/services/ads.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { AdDto, UpdateAdManagementCommand } from '../../../../models/ads.models';
import { CategoryDto } from '../../../../models/categories.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-ad-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatStepperModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatDialogModule,
    LucideAngularModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './ad-edit.component.html',
  styleUrls: ['./ad-edit.component.scss']
})
export class AdEditComponent implements OnInit, OnDestroy {
  // Ad data
  ad: AdDto | null = null;
  adId: string = '';
  
  // Stepper
  currentStep = 0;
  steps = [
    { label: 'المعلومات الأساسية', icon: 'file-text' },
    { label: 'الصور', icon: 'image' },
    { label: 'المراجعة والحفظ', icon: 'eye' }
  ];

  // Forms
  basicInfoForm!: FormGroup;
  imagesForm!: FormGroup;
  reviewForm!: FormGroup;

  // Data
  categories: CategoryDto[] = [];
  existingImages: string[] = [];
  newImages: File[] = [];
  imagePreviews: string[] = [];
  imagesToDelete: string[] = [];
  
  // Loading states
  isLoading = false;
  isLoadingAd = false;
  isUploadingImages = false;
  error = '';

  // Chip input separator keys
  separatorKeysCodes: number[] = [13, 188]; // Enter and comma

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adsService = inject(AdsService);
  private categoriesService = inject(CategoriesService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      this.adId = params['id'];
      if (this.adId) {
        this.loadAdDetails();
        this.loadCategories();
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    // Basic Information Form
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(1000)]],
      price: ['', [Validators.required, Validators.min(1)]],
      location: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: ['', [Validators.required]],
      keywords: this.fb.array([])
    });

    // Images Form
    this.imagesForm = this.fb.group({
      images: this.fb.array([])
    });

    // Review Form
    this.reviewForm = this.fb.group({
      finalTitle: [''],
      finalDescription: [''],
      finalKeywords: this.fb.array([])
    });
  }

  loadAdDetails() {
    this.isLoadingAd = true;
    this.error = '';

    this.adsService.getById(this.adId).subscribe({
      next: (response) => {
        this.isLoadingAd = false;
        if (response.success && response.data) {
          this.ad = response.data;
          this.populateForms();
        }
      },
      error: (error: unknown) => {
        this.isLoadingAd = false;
        this.error = 'حدث خطأ أثناء تحميل تفاصيل الإعلان';
        this.toastr.error('حدث خطأ أثناء تحميل الإعلان', 'خطأ');
        console.error('Error loading ad details:', error);
      }
    });
  }

  loadCategories() {
    this.categoriesService.getAllCategories().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error: unknown) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  populateForms() {
    if (!this.ad) return;

    // Populate basic info form
    this.basicInfoForm.patchValue({
      title: this.ad.title,
      description: this.ad.description,
      price: this.ad.price,
      location: this.ad.location,
      categoryId: this.ad.categoryId
    });

    // Populate keywords
    const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
    keywordsArray.clear();
    if (this.ad.keywords) {
      this.ad.keywords.forEach(keyword => {
        keywordsArray.push(this.fb.control(keyword));
      });
    }

    // Set existing images
    this.existingImages = [...(this.ad.images || [])];
    this.imagePreviews = [...this.existingImages];

    // Populate review form
    this.reviewForm.patchValue({
      finalTitle: this.ad.title,
      finalDescription: this.ad.description
    });

    const reviewKeywordsArray = this.reviewForm.get('finalKeywords') as FormArray;
    reviewKeywordsArray.clear();
    if (this.ad.keywords) {
      this.ad.keywords.forEach(keyword => {
        reviewKeywordsArray.push(this.fb.control(keyword));
      });
    }
  }

  onStepChange(event: any) {
    this.currentStep = event.selectedIndex;
  }

  nextStep() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  // Basic Info Methods
  addKeyword(keyword: string) {
    if (keyword.trim()) {
      const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
      keywordsArray.push(this.fb.control(keyword.trim()));
    }
  }

  removeKeyword(index: number) {
    const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
    keywordsArray.removeAt(index);
  }

  // Image Methods
  onImageSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.isUploadingImages = true;
      
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.newImages.push(file);
          
          // Create preview
          const reader = new FileReader();
          reader.onload = (e) => {
            this.imagePreviews.push(e.target?.result as string);
          };
          reader.readAsDataURL(file);
        }
      });
      
      this.isUploadingImages = false;
    }
  }

  removeImage(index: number) {
    if (index < this.existingImages.length) {
      // Remove existing image
      const imageToDelete = this.existingImages[index];
      this.imagesToDelete.push(imageToDelete);
      this.existingImages.splice(index, 1);
    } else {
      // Remove new image
      const newImageIndex = index - this.existingImages.length;
      this.newImages.splice(newImageIndex, 1);
    }
    this.imagePreviews.splice(index, 1);
  }

  // Review Methods
  prepareReviewData() {
    this.reviewForm.patchValue({
      finalTitle: this.basicInfoForm.get('title')?.value,
      finalDescription: this.basicInfoForm.get('description')?.value
    });

    // Update keywords in review form
    const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
    const reviewKeywordsArray = this.reviewForm.get('finalKeywords') as FormArray;
    reviewKeywordsArray.clear();
    keywordsArray.controls.forEach(control => {
      reviewKeywordsArray.push(this.fb.control(control.value));
    });
  }

  // Save Methods
  saveChanges() {
    if (this.basicInfoForm.valid) {
      this.isLoading = true;

      const updateCommand: UpdateAdManagementCommand = {
        adId: this.adId,
        userId: 'current-user-id', // This should come from auth service
        title: this.reviewForm.get('finalTitle')?.value,
        description: this.reviewForm.get('finalDescription')?.value,
        price: this.basicInfoForm.get('price')?.value,
        location: this.basicInfoForm.get('location')?.value,
        categoryId: this.basicInfoForm.get('categoryId')?.value,
        keywords: this.reviewForm.get('finalKeywords')?.value,
        newImages: this.newImages,
        imagesToDelete: this.imagesToDelete
      };

      this.adsService.updateAd(this.adId, updateCommand).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.toastr.success('تم تحديث الإعلان بنجاح', 'تم');
            this.router.navigate(['/ads/details', this.adId]);
          }
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.toastr.error('حدث خطأ أثناء تحديث الإعلان', 'خطأ');
          console.error('Error updating ad:', error);
        }
      });
    }
  }

  saveDraft() {
    // Implement save as draft functionality
    this.toastr.info('تم حفظ المسودة', 'تم');
  }

  // Validation Methods
  isStepValid(stepIndex: number): boolean {
    switch (stepIndex) {
      case 0:
        return this.basicInfoForm.valid;
      case 1:
        return this.imagePreviews.length > 0;
      case 2:
        return this.reviewForm.valid;
      default:
        return false;
    }
  }

  canProceedToNext(): boolean {
    return this.isStepValid(this.currentStep);
  }

  getStepIcon(stepIndex: number): string {
    return this.steps[stepIndex].icon;
  }

  // Utility Methods
  isExistingImage(index: number): boolean {
    return index < this.existingImages.length;
  }

  getImageSource(index: number): string {
    if (this.isExistingImage(index)) {
      return this.existingImages[index];
    }
    return this.imagePreviews[index];
  }
}
