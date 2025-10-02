import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';
import { AdsService } from '../ads/ads.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/auth/auth.service';
import { FileService } from '../../core/services/file.service';
import { ImageValidationService } from '../../core/services/image-validation.service';
import { AdItem } from '../../models/ads.models';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  categories: any[] = [];
  keywords: string[] = [];
  uploading = false;
  saving = false;
  error = '';
  currentUser: any;
  
  private destroy$ = new Subject<void>();
  private adsService = inject(AdsService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private fileService = inject(FileService);
  private imageValidationService = inject(ImageValidationService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      price: [null, [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      categoryId: [null, Validators.required],
      keywords: [[]],
      status: ['Draft', Validators.required],
      scheduledAt: [''],
      // Contact Information
      contactNumber: ['', [Validators.required, Validators.minLength(10)]],
      contactMethod: ['Call', Validators.required]
    });
  }

  loadCategories() {
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categories: any[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.snackBar.open('خطأ في تحميل الفئات', 'إغلاق', { duration: 3000 });
      }
    });
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    
    // Use enhanced validation service
    const validationResult = this.imageValidationService.validateImageFiles(files);
    
    // Show validation summary
    if (validationResult.hasErrors) {
      const summary = this.imageValidationService.getValidationSummary(validationResult);
      this.snackBar.open(summary, 'إغلاق', { duration: 5000 });
      
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
    const totalFiles = this.selectedFiles.length + validationResult.validFiles.length;
    if (totalFiles > 12) {
      this.snackBar.open(`الحد الأقصى للصور هو 12 صورة. لديك ${this.selectedFiles.length} صور، تحاول إضافة ${validationResult.validFiles.length}`, 'إغلاق', { duration: 4000 });
      return;
    }

    this.selectedFiles = [...this.selectedFiles, ...validationResult.validFiles];
    this.generatePreviews(validationResult.validFiles);
    
    // Show success message if some files were processed
    if (validationResult.validFiles.length > 0) {
      const message = validationResult.hasErrors 
        ? `تم إضافة ${validationResult.validFiles.length} صور صالحة من أصل ${files.length}`
        : `تم إضافة ${validationResult.validFiles.length} صور بنجاح`;
      this.snackBar.open(message, 'إغلاق', { duration: 3000 });
    }
  }

  private generatePreviews(files: File[]) {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.previewUrls.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.previewUrls.splice(index, 1);
    this.selectedFiles.splice(index, 1);
  }

  addKeyword(keyword: string) {
    if (!keyword.trim()) return;
    
    const keywords = this.form.get('keywords')?.value || [];
    if (!keywords.includes(keyword.trim())) {
      keywords.push(keyword.trim());
      this.form.patchValue({ keywords });
    }
  }

  removeKeyword(keyword: string) {
    const keywords = this.form.get('keywords')?.value || [];
    const index = keywords.indexOf(keyword);
    if (index > -1) {
      keywords.splice(index, 1);
      this.form.patchValue({ keywords });
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.error = 'يرجى ملء جميع الحقول المطلوبة';
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
      return;
    }

    this.saving = true;
    this.error = '';

    try {
      const formValue = this.form.value;
      const adData: Partial<AdItem> = {
        title: formValue.title,
        description: formValue.description,
        price: formValue.price,
        location: formValue.location,
        categoryId: formValue.categoryId,
        keywords: formValue.keywords || [],
        status: formValue.status,
        images: [],
        // Contact Information
        contactNumber: formValue.contactNumber,
        contactMethod: formValue.contactMethod
      };

      let createdAd: AdItem;
      
      if (this.selectedFiles.length > 0) {
        // Create with files
        const result = await this.adsService.createWithFiles(adData, this.selectedFiles).toPromise();
        if (!result) throw new Error('Failed to create ad with files');
        createdAd = result;
      } else {
        // Create without files
        const result = await this.adsService.create(adData).toPromise();
        if (!result) throw new Error('Failed to create ad');
        createdAd = result;
      }
      
      this.saving = false;
      this.snackBar.open('تم إنشاء الإعلان بنجاح', 'إغلاق', { duration: 3000 });
      this.router.navigate(['/ads', createdAd.id]);
    } catch (error: any) {
      console.error('Error creating ad:', error);
      this.saving = false;
      this.error = 'حدث خطأ أثناء إنشاء الإعلان';
      this.snackBar.open('حدث خطأ أثناء إنشاء الإعلان', 'إغلاق', { duration: 3000 });
    }
  }

  async saveAsDraft() {
    this.form.patchValue({ status: 'Draft' });
    await this.submit();
  }

  async publish() {
    this.form.patchValue({ status: 'Published' });
    await this.submit();
  }

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
}
