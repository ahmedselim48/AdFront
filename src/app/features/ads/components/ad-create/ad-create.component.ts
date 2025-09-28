import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
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
import { LucideAngularModule, Upload, Image, Zap, Eye, Save, ArrowLeft, ArrowRight, X, Plus } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../../core/services/ads.service';
import { CategoriesService } from '../../../../core/services/categories.service';
import { AdDto, CreateAdWithFilesCommand, AdGenerationResponse } from '../../../../models/ads.models';
import { CategoryDto } from '../../../../models/categories.models';
// import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-ad-create',
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
    LucideAngularModule
    // LoadingSpinnerComponent
  ],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent implements OnInit, OnDestroy {
  // Stepper
  currentStep = 0;
  steps = [
    { label: 'المعلومات الأساسية', icon: 'file-text' },
    { label: 'الصور', icon: 'image' },
    { label: 'الذكاء الاصطناعي', icon: 'zap' },
    { label: 'المراجعة والنشر', icon: 'eye' }
  ];

  // Forms
  basicInfoForm!: FormGroup;
  imagesForm!: FormGroup;
  aiForm!: FormGroup;
  reviewForm!: FormGroup;

  // Data
  categories: CategoryDto[] = [];
  uploadedImages: File[] = [];
  imagePreviews: string[] = [];
  aiGeneratedContent: AdGenerationResponse | null = null;
  
  // Loading states
  isLoading = false;
  isGeneratingAI = false;
  isUploadingImages = false;
  
  // Generated ad data
  generatedAd: Partial<AdDto> = {};

  // Chip input separator keys
  separatorKeysCodes: number[] = [13, 188]; // Enter and comma

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private fb = inject(FormBuilder);
  private adsService = inject(AdsService);
  private categoriesService = inject(CategoriesService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadCategories();
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

    // AI Form
    this.aiForm = this.fb.group({
      useAI: [false],
      productName: [''],
      initialDescription: ['']
    });

    // Review Form
    this.reviewForm = this.fb.group({
      finalTitle: [''],
      finalDescription: [''],
      finalKeywords: this.fb.array([]),
      scheduledAtUtc: [null]
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
        this.toastr.error('حدث خطأ أثناء تحميل الفئات', 'خطأ');
      }
    });
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
          this.uploadedImages.push(file);
          
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
    this.uploadedImages.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // AI Methods
  generateAIContent() {
    if (!this.aiForm.get('useAI')?.value) return;

    const productName = this.aiForm.get('productName')?.value;
    const initialDescription = this.aiForm.get('initialDescription')?.value;
    const price = this.basicInfoForm.get('price')?.value;

    if (!productName || !initialDescription || !price) {
      this.toastr.warning('يرجى ملء جميع الحقول المطلوبة', 'تحذير');
      return;
    }

    this.isGeneratingAI = true;

    const formData = new FormData();
    formData.append('productName', productName);
    formData.append('initialDescription', initialDescription);
    formData.append('price', price.toString());
    formData.append('userId', 'current-user-id'); // This should come from auth service

    // Add images if available
    this.uploadedImages.forEach((image, index) => {
      formData.append(`images`, image);
    });

    this.adsService.generateAdContent(formData).subscribe({
      next: (response) => {
        this.isGeneratingAI = false;
        if (response.success && response.data) {
          this.aiGeneratedContent = response.data;
          
          // Update forms with AI generated content
          this.basicInfoForm.patchValue({
            title: response.data.generatedTitle,
            description: response.data.generatedDescription
          });

          // Add generated keywords
          const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
          keywordsArray.clear();
          response.data.generatedKeywords.forEach((keyword: string) => {
            keywordsArray.push(this.fb.control(keyword));
          });

          this.toastr.success('تم توليد المحتوى بنجاح', 'تم');
        }
      },
      error: (error: unknown) => {
        this.isGeneratingAI = false;
        this.toastr.error('حدث خطأ أثناء توليد المحتوى', 'خطأ');
        console.error('Error generating AI content:', error);
      }
    });
  }

  // Review Methods
  prepareReviewData() {
    this.generatedAd = {
      title: this.basicInfoForm.get('title')?.value,
      description: this.basicInfoForm.get('description')?.value,
      price: this.basicInfoForm.get('price')?.value,
      location: this.basicInfoForm.get('location')?.value,
      categoryId: this.basicInfoForm.get('categoryId')?.value,
      keywords: this.basicInfoForm.get('keywords')?.value,
      images: this.imagePreviews
    };

    // Update review form
    this.reviewForm.patchValue({
      finalTitle: this.generatedAd.title,
      finalDescription: this.generatedAd.description,
      finalKeywords: this.generatedAd.keywords
    });
  }

  // Publish Methods
  publishAd() {
    if (this.reviewForm.valid) {
      this.isLoading = true;

      const createCommand: CreateAdWithFilesCommand = {
        title: this.reviewForm.get('finalTitle')?.value,
        description: this.reviewForm.get('finalDescription')?.value,
        price: this.basicInfoForm.get('price')?.value,
        location: this.basicInfoForm.get('location')?.value,
        userId: 'current-user-id', // This should come from auth service
        categoryId: this.basicInfoForm.get('categoryId')?.value,
        keywords: this.reviewForm.get('finalKeywords')?.value,
        images: this.uploadedImages
      };

      this.adsService.createWithFiles(createCommand).subscribe({
        next: (response) => {
          this.isLoading = false;
          if (response.success && response.data) {
            this.toastr.success('تم إنشاء الإعلان بنجاح', 'تم');
            this.router.navigate(['/ads/details', response.data.id]);
          }
        },
        error: (error: unknown) => {
          this.isLoading = false;
          this.toastr.error('حدث خطأ أثناء إنشاء الإعلان', 'خطأ');
          console.error('Error creating ad:', error);
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
        return this.uploadedImages.length > 0;
      case 2:
        return true; // AI step is optional
      case 3:
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
}
