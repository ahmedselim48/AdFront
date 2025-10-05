import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatRadioModule } from '@angular/material/radio';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { AdsService } from '../ads/ads.service';
import { CategoryService } from '../../core/services/category.service';
import { AuthService } from '../../core/auth/auth.service';
import { FileService } from '../../core/services/file.service';
import { ImageValidationService } from '../../core/services/image-validation.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { SubscriptionRequiredDialogComponent } from '../../shared/components/subscription-required-dialog/subscription-required-dialog.component';
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
    MatSnackBarModule,
    MatCardModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    MatStepperModule,
    MatTooltipModule,
    MatDialogModule
  ],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  basicInfoForm!: FormGroup;
  detailsForm!: FormGroup;
  contactForm!: FormGroup;
  abTestForm!: FormGroup;
  categories: any[] = [];
  existingAds: AdItem[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  loading = false;
  saving = false;
  error: string | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adsService: AdsService,
    private categoryService: CategoryService,
    private authService: AuthService,
    private fileService: FileService,
    private imageValidationService: ImageValidationService,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
    this.loadExistingAds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    // Main form
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      categoryId: [null, Validators.required],
      keywords: [[]],
      contactNumber: [''],
      contactMethod: ['Call'],
      // A/B Testing options
      enableABTesting: [false],
      abTestType: ['create-variant'],
      variantChange: [''],
      variantText: [''],
      existingAdId: [''],
      abTestEndDate: [''],
      abTestDescription: ['']
    });

    // Step forms for stepper
    this.basicInfoForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      price: [0, [Validators.required, Validators.min(0)]],
      location: ['', Validators.required],
      categoryId: [null, Validators.required]
    });

    this.detailsForm = this.fb.group({
      keywords: [[]]
    });

    this.contactForm = this.fb.group({
      contactNumber: [''],
      contactMethod: ['Call']
    });

    this.abTestForm = this.fb.group({
      enableABTesting: [false],
      abTestType: ['create-variant'],
      variantChange: [''],
      variantText: [''],
      existingAdId: [''],
      abTestEndDate: [''],
      abTestDescription: ['']
    });
  }

  private loadCategories() {
    this.categoryService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (categories) => {
          this.categories = categories;
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          this.snackBar.open('خطأ في تحميل الفئات', 'إغلاق', { duration: 3000 });
        }
      });
  }

  private loadExistingAds() {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.adsService.getMyAds()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (ads) => {
            this.existingAds = ads.filter(ad => ad.status === 'Published');
          },
          error: (error) => {
            console.error('Error loading existing ads:', error);
          }
        });
    }
  }

  getVariantPlaceholder(): string {
    const variantChange = this.form.get('variantChange')?.value;
    switch (variantChange) {
      case 'title':
        return 'مثال: سيارة تويوتا كامري 2023 - حالة ممتازة';
      case 'description':
        return 'مثال: سيارة ممتازة، حالة جيدة جداً، موديل 2023، صيانة دورية';
      case 'price':
        return 'مثال: 85000';
      case 'images':
        return 'سيتم استخدام صور مختلفة';
      default:
        return 'أدخل النص البديل';
    }
  }

  toggleABTesting() {
    const currentValue = this.form.get('enableABTesting')?.value;
    this.form.patchValue({ enableABTesting: !currentValue });
  }

  onFileChange(event: any) {
    const files = Array.from(event.target.files) as File[];
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValid = file.type.startsWith('image/') && file.size <= 5 * 1024 * 1024; // 5MB limit
      if (!isValid) {
        this.snackBar.open(`الملف ${file.name} غير صالح`, 'إغلاق', { duration: 3000 });
      }
      return isValid;
    });

    this.selectedFiles = [...this.selectedFiles, ...validFiles];
    
    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrls.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeImage(index: number) {
    this.selectedFiles.splice(index, 1);
    this.previewUrls.splice(index, 1);
  }

  addKeyword(keyword: string) {
    if (keyword.trim()) {
      const keywords = this.form.get('keywords')?.value || [];
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

  submit() {
    this.onSubmit();
  }

  cancel() {
    this.onCancel();
  }

  saveAsDraft() {
    if (this.form.valid) {
      this.saving = true;
      const formValue = this.form.value;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', { duration: 3000 });
        this.saving = false;
        return;
      }

      const adData: AdItem = {
        ...formValue,
        userId: currentUser.id,
        status: 'Draft',
        viewsCount: 0,
        clicksCount: 0,
        likesCount: 0,
        commentsCount: 0,
        createdAt: new Date(),
        isAIGenerated: false
      };

      this.adsService.create(adData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdAd) => {
            this.saving = false;
            this.snackBar.open('تم حفظ الإعلان كمسودة', 'إغلاق', { duration: 3000 });
            this.router.navigate(['/ads', createdAd.id]);
          },
          error: (error) => {
            this.saving = false;
            console.error('Error saving draft:', error);
            this.snackBar.open('خطأ في حفظ المسودة', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  onSubmit() {
    if (this.form.valid) {
      this.saving = true;
      const formValue = this.form.value;
      const currentUser = this.authService.getCurrentUser();

      if (!currentUser) {
        this.snackBar.open('يجب تسجيل الدخول أولاً', 'إغلاق', { duration: 3000 });
        this.saving = false;
        return;
      }

      // Check subscription before creating ad
      this.checkSubscriptionAndCreateAd(formValue);
    } else {
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
    }
  }

  private checkSubscriptionAndCreateAd(formValue: any) {
    this.subscriptionService.hasActiveSubscription().pipe(takeUntil(this.destroy$)).subscribe({
      next: (hasActiveSubscription) => {
        if (hasActiveSubscription) {
          this.createAd(formValue);
        } else {
          this.showSubscriptionRequiredDialog();
        }
      },
      error: (error) => {
        console.error('Error checking subscription:', error);
        // If we can't check subscription, allow creation but show warning
        this.createAd(formValue);
      }
    });
  }

  private showSubscriptionRequiredDialog() {
    const dialogRef = this.dialog.open(SubscriptionRequiredDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.saving = false;
      if (result === 'subscribe') {
        this.router.navigate(['/profile/subscription']);
      }
    });
  }

  private createAd(formValue: any) {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) return;

    const adData: AdItem = {
      ...formValue,
      userId: currentUser.id,
      status: 'Published',
      viewsCount: 0,
      clicksCount: 0,
      likesCount: 0,
      commentsCount: 0,
      createdAt: new Date(),
      isAIGenerated: false
    };

    // Create ad with or without files
    if (this.selectedFiles.length > 0) {
      this.adsService.createWithFiles(adData, this.selectedFiles)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdAd) => {
            this.saving = false;
            this.snackBar.open('تم إنشاء الإعلان بنجاح', 'إغلاق', { duration: 3000 });
            this.router.navigate(['/ads', createdAd.id]);
          },
          error: (error) => {
            this.saving = false;
            console.error('Error creating ad:', error);
            this.snackBar.open('خطأ في إنشاء الإعلان', 'إغلاق', { duration: 3000 });
          }
        });
    } else {
      this.adsService.create(adData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (createdAd) => {
            this.saving = false;
            this.snackBar.open('تم إنشاء الإعلان بنجاح', 'إغلاق', { duration: 3000 });
            this.router.navigate(['/ads', createdAd.id]);
          },
          error: (error) => {
            this.saving = false;
            console.error('Error creating ad:', error);
            this.snackBar.open('خطأ في إنشاء الإعلان', 'إغلاق', { duration: 3000 });
          }
        });
    }
  }

  onCancel() {
    this.router.navigate(['/ads']);
  }
}