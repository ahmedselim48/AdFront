import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
// import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AdsService } from '../../ads.service';
import { AdItem } from '../../../../models/ads.models';
import { CategoryService } from '../../../../core/services/category.service';
import { FileService } from '../../../../core/services/file.service';
import { ImageValidationService } from '../../../../core/services/image-validation.service';

@Component({
  selector: 'app-ad-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ad-edit.component.html',
  styleUrls: ['./ad-edit.component.scss']
})
export class AdEditComponent implements OnInit, OnDestroy {
  ad: AdItem | null = null;
  form!: FormGroup;
  loading = false;
  saving = false;
  categories: any[] = [];
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adsService = inject(AdsService);
  private categoryService = inject(CategoryService);
  private fileService = inject(FileService);
  private imageValidationService = inject(ImageValidationService);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
    this.loadCategories();
    this.loadAd();
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
      categoryId: [null],
      keywords: [[]],
      status: ['Draft', Validators.required],
      scheduledAt: [''],
      // Contact Information
      contactNumber: ['', [Validators.required, Validators.minLength(10)]],
      contactMethod: ['Call', Validators.required]
    });
  }

  loadAd() {
    const adId = this.route.snapshot.paramMap.get('id');
    if (!adId) return;

    this.loading = true;
    this.adsService.getById(adId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (ad) => {
        this.ad = ad;
        this.populateForm(ad);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ad:', error);
        this.loading = false;
      }
    });
  }

  loadCategories() {
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (categories: any[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
      }
    });
  }

  private populateForm(ad: AdItem) {
    // Convert status to string
    let statusString = 'Draft';
    
    // Handle both string and number status values
    if (typeof ad.status === 'number') {
      statusString = ad.status === 2 ? 'Published' : 'Draft';
    } else if (typeof ad.status === 'string') {
      statusString = ad.status === 'Published' ? 'Published' : 'Draft';
    }

    this.form.patchValue({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      location: ad.location,
      categoryId: ad.categoryId,
      keywords: ad.keywords || [],
      status: statusString,
      scheduledAt: ad.scheduledAtUtc ? new Date(ad.scheduledAtUtc).toISOString().slice(0, 16) : '',
      // Contact Information
      contactNumber: ad.contactNumber || ad.contactInfo?.phoneNumber || ad.contactInfo?.whatsappNumber || '',
      contactMethod: ad.contactMethod || (ad.contactInfo?.phoneNumber ? 'Call' : 'WhatsApp')
    });
    
    this.previewUrls = [...(ad.images || [])];
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const files = Array.from(input.files);
    const validationResult = this.imageValidationService.validateImageFiles(files);
    
    if (validationResult.validFiles.length === 0) {
      console.log('⚠ No valid image files selected');
      return;
    }
    
    this.selectedFiles = [...this.selectedFiles, ...validationResult.validFiles];
    
    // Generate preview URLs for valid files only
    validationResult.validFiles.forEach(file => {
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
    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }
  }

  async save() {
    if (this.form.invalid || this.saving || !this.ad) return;

    this.saving = true;
    const formValue = this.form.value;
    
    const updateData: Partial<AdItem> = {
      title: formValue.title,
      description: formValue.description,
      price: formValue.price,
      location: formValue.location,
      categoryId: formValue.categoryId,
      keywords: formValue.keywords || [],
      status: formValue.status,
      // Contact Information
      contactNumber: formValue.contactNumber,
      contactMethod: formValue.contactMethod
    };

    try {
      let updatedAd: AdItem;
      
      if (this.selectedFiles.length > 0) {
        // Update with new files
        const result = await this.adsService.updateWithFiles(this.ad.id, updateData, this.selectedFiles).toPromise();
        if (!result) throw new Error('Failed to update ad with files');
        updatedAd = result;
      } else {
        // Update without files
        const result = await this.adsService.update(this.ad.id, updateData).toPromise();
        if (!result) throw new Error('Failed to update ad');
        updatedAd = result;
      }
      
      this.saving = false;
      this.router.navigate(['/ads', updatedAd.id]);
    } catch (error) {
      console.error('Error updating ad:', error);
      this.saving = false;
    }
  }

  async saveAsDraft() {
    this.form.patchValue({ status: 'Draft' });
    await this.save();
  }

  async publish() {
    this.form.patchValue({ status: 'Published' });
    await this.save();
  }

  cancel() {
    this.router.navigate(['/ads', this.ad?.id]);
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

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }
}