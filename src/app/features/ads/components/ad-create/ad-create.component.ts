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
import { AuthService } from '../../../../core/auth/auth.service';
import { FileService } from '../../../../core/services/file.service';
import { ImageValidationService } from '../../../../core/services/image-validation.service';
import { CategoryService } from '../../../../core/services/category.service';
import { AdDto, CreateAdWithFilesCommand, CreateAdCommand, AdGenerationResponse, AdItem, CreateAdDto } from '../../../../models/ads.models';
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

  // User role check
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      // Fallback: check localStorage for user data
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as any;
          return parsedUser.roles?.includes('Admin') || parsedUser.roles?.includes('admin') || false;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
    return user.roles?.includes('Admin') || user.roles?.includes('admin') || false;
  }

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private fb = inject(FormBuilder);
  private adsService = inject(AdsService);
  private categoriesService = inject(CategoriesService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private fileService = inject(FileService);
  private imageValidationService = inject(ImageValidationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  constructor() {
    this.initializeForms();
  }

  ngOnInit() {
    // Check if user is admin and redirect
    if (this.isAdmin) {
      this.router.navigate(['/ads']);
      return;
    }
    
    this.loadCategories();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForms() {
    // Basic Information Form
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(5000)]],
      price: ['', [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
      categoryId: ['', [Validators.required]],
      keywords: this.fb.array([]),
      status: ['Draft', Validators.required],
      scheduledAt: [''],
      // Contact Information
      contactNumber: ['', [Validators.required, Validators.minLength(10)]],
      contactMethod: ['Call', Validators.required]
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
    // Try both services for compatibility
    this.categoriesService.getAllCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.categories = response.data;
        }
      },
      error: (error: unknown) => {
        console.error('Error loading categories from main service:', error);
        // Fallback to alternative service
        this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
          next: (categories: any[]) => {
            this.categories = categories;
          },
          error: (fallbackError: any) => {
            console.error('Error loading categories from fallback service:', fallbackError);
            this.toastr.error('حدث خطأ أثناء تحميل الفئات', 'خطأ');
          }
        });
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
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    
    // Use enhanced validation service
    const validationResult = this.imageValidationService.validateImageFiles(files);
    
    // Show validation summary
    if (validationResult.hasErrors) {
      const summary = this.imageValidationService.getValidationSummary(validationResult);
      this.toastr.warning(summary, 'تحذير');
      
      // Show detailed errors for each file
      validationResult.skippedFiles.forEach(skippedFile => {
        console.warn(`⚠ ${skippedFile.fileName}: ${skippedFile.details}`);
        if (skippedFile.suggestedAction) {
          console.info(`💡 Suggestion: ${skippedFile.suggestedAction}`);
        }
      });
    }
    
    // Only proceed with valid files
    if (validationResult.validFiles.length === 0) {
      console.log('⚠ No valid image files selected');
      return;
    }

    // Check total file limit (12 images max)
    const totalFiles = this.uploadedImages.length + validationResult.validFiles.length;
    if (totalFiles > 12) {
      this.toastr.warning(`الحد الأقصى للصور هو 12 صورة. لديك ${this.uploadedImages.length} صور، تحاول إضافة ${validationResult.validFiles.length}`, 'تحذير');
      return;
    }

    this.isUploadingImages = true;
    this.uploadedImages = [...this.uploadedImages, ...validationResult.validFiles];
    this.generateImagePreviews(validationResult.validFiles);
    
    // Show success message if some files were processed
    if (validationResult.validFiles.length > 0) {
      const message = validationResult.hasErrors 
        ? `تم إضافة ${validationResult.validFiles.length} صور صالحة من أصل ${files.length}`
        : `تم إضافة ${validationResult.validFiles.length} صور بنجاح`;
      this.toastr.success(message, 'تم');
    }
    
    this.isUploadingImages = false;
  }

  private generateImagePreviews(files: File[]) {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imagePreviews.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
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

    // Note: generateAdContent method needs to be implemented in AdsService
    // For now, we'll show a placeholder message
    this.isGeneratingAI = false;
    this.toastr.info('ميزة الذكاء الاصطناعي قيد التطوير', 'معلومات');
    
    /* 
    this.adsService.generateAdContent(formData).subscribe({
      next: (response: any) => {
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
    */
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
  async publishAd() {
    if (!this.reviewForm.valid) {
      this.toastr.warning('يرجى ملء جميع الحقول المطلوبة', 'تحذير');
      return;
    }

    this.isLoading = true;

    try {
      const adData: CreateAdDto = {
        title: this.reviewForm.get('finalTitle')?.value || this.basicInfoForm.get('title')?.value,
        description: this.reviewForm.get('finalDescription')?.value || this.basicInfoForm.get('description')?.value,
        price: this.basicInfoForm.get('price')?.value,
        location: this.basicInfoForm.get('location')?.value,
        categoryId: this.basicInfoForm.get('categoryId')?.value,
        tags: this.reviewForm.get('finalKeywords')?.value || this.basicInfoForm.get('keywords')?.value || [],
        contactInfo: this.basicInfoForm.get('contactNumber')?.value
      };

      let createdAd: any;
      
      if (this.uploadedImages.length > 0) {
        // Create with files
        const adWithFiles = { ...adData, files: this.uploadedImages };
        const result = await this.adsService.createWithFiles(adWithFiles).toPromise();
        if (!result || !result.success || !result.data) throw new Error('Failed to create ad with files');
        createdAd = result.data;
      } else {
        // Create without files
        const result = await this.adsService.createAd(adData).toPromise();
        if (!result || !result.success || !result.data) throw new Error('Failed to create ad');
        createdAd = result.data;
      }
      
      this.isLoading = false;
      this.toastr.success('تم إنشاء الإعلان بنجاح', 'تم');
      this.router.navigate(['/ads', createdAd.id]);
    } catch (error: any) {
      console.error('Error creating ad:', error);
      this.isLoading = false;
      this.toastr.error('حدث خطأ أثناء إنشاء الإعلان', 'خطأ');
    }
  }

  async saveDraft() {
    this.basicInfoForm.patchValue({ status: 'Draft' });
    
    try {
      const adData: CreateAdDto = {
        title: this.basicInfoForm.get('title')?.value,
        description: this.basicInfoForm.get('description')?.value,
        price: this.basicInfoForm.get('price')?.value,
        location: this.basicInfoForm.get('location')?.value,
        categoryId: this.basicInfoForm.get('categoryId')?.value,
        tags: this.basicInfoForm.get('keywords')?.value || [],
        contactInfo: this.basicInfoForm.get('contactNumber')?.value
      };

      let createdAd: any;
      
      if (this.uploadedImages.length > 0) {
        // Create with files
        const adWithFiles = { ...adData, files: this.uploadedImages };
        const result = await this.adsService.createWithFiles(adWithFiles).toPromise();
        if (!result || !result.success || !result.data) throw new Error('Failed to create ad with files');
        createdAd = result.data;
      } else {
        // Create without files
        const result = await this.adsService.createAd(adData).toPromise();
        if (!result || !result.success || !result.data) throw new Error('Failed to create ad');
        createdAd = result.data;
      }
      
      this.toastr.success('تم حفظ المسودة بنجاح', 'تم');
      this.router.navigate(['/ads', createdAd.id]);
    } catch (error: any) {
      console.error('Error saving draft:', error);
      this.toastr.error('حدث خطأ أثناء حفظ المسودة', 'خطأ');
    }
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

  // Additional utility methods from the other component
  cancel() {
    this.router.navigate(['/ads']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  }

  // Enhanced keyword management
  addKeywordFromInput(keyword: string) {
    if (!keyword.trim()) return;
    
    const keywordsArray = this.basicInfoForm.get('keywords') as FormArray;
    const currentKeywords = keywordsArray.value || [];
    
    if (!currentKeywords.includes(keyword.trim())) {
      keywordsArray.push(this.fb.control(keyword.trim()));
      this.toastr.success(`تمت إضافة الكلمة المفتاحية: ${keyword.trim()}`, 'تم');
    } else {
      this.toastr.warning('هذه الكلمة المفتاحية موجودة بالفعل', 'تحذير');
    }
  }

  // File validation helper
  private isValidImageFile(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!validTypes.includes(file.type)) {
      this.toastr.warning(`نوع الملف غير مدعوم: ${file.name}`, 'تحذير');
      return false;
    }
    
    if (file.size > maxSize) {
      this.toastr.warning(`حجم الملف كبير جداً: ${file.name}`, 'تحذير');
      return false;
    }
    
    return true;
  }

  // Form validation helpers
  isFieldInvalid(formName: string, fieldName: string): boolean {
    const form = this.getForm(formName);
    const field = form?.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(formName: string, fieldName: string): string {
    const form = this.getForm(formName);
    const field = form?.get(fieldName);
    
    if (field?.errors) {
      if (field.errors['required']) return 'هذا الحقل مطلوب';
      if (field.errors['minlength']) return `الحد الأدنى ${field.errors['minlength'].requiredLength} أحرف`;
      if (field.errors['maxlength']) return `الحد الأقصى ${field.errors['maxlength'].requiredLength} حرف`;
      if (field.errors['min']) return `القيمة يجب أن تكون أكبر من ${field.errors['min'].min}`;
      if (field.errors['email']) return 'البريد الإلكتروني غير صحيح';
    }
    
    return '';
  }

  private getForm(formName: string): FormGroup | null {
    switch (formName) {
      case 'basic': return this.basicInfoForm;
      case 'images': return this.imagesForm;
      case 'ai': return this.aiForm;
      case 'review': return this.reviewForm;
      default: return null;
    }
  }
}
