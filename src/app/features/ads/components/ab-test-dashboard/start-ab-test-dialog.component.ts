import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { Subject, takeUntil } from 'rxjs';
import { AdsService } from '../../ads.service';
import { AdDto } from '../../../../models/ads.models';

export interface StartABTestDialogData {
  adAId?: string;
  adBId?: string;
}

@Component({
  selector: 'app-start-ab-test-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCardModule,
    MatChipsModule
  ],
  templateUrl: './start-ab-test-dialog.component.html',
  styleUrls: ['./start-ab-test-dialog.component.scss']
})
export class StartABTestDialogComponent implements OnInit, OnDestroy {
  abTestForm!: FormGroup;
  myAds: AdDto[] = [];
  loading = false;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private adsService: AdsService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<StartABTestDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: StartABTestDialogData
  ) {}

  ngOnInit() {
    this.initializeForm();
    this.loadMyAds();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.abTestForm = this.fb.group({
      adAId: [this.data?.adAId || '', Validators.required],
      adBId: [this.data?.adBId || '', Validators.required],
      endsAtUtc: ['', Validators.required],
      testName: ['', Validators.required],
      description: ['']
    }, { validators: this.differentAdsValidator });
  }

  private differentAdsValidator(group: FormGroup) {
    const adAId = group.get('adAId')?.value;
    const adBId = group.get('adBId')?.value;
    
    if (adAId && adBId && adAId === adBId) {
      return { sameAds: true };
    }
    
    return null;
  }

  private loadMyAds() {
    this.loading = true;
    console.log('Loading ads...');
    this.adsService.getMyAds('Active')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (ads) => {
          console.log('Ads loaded:', ads);
          this.myAds = ads;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading ads:', error);
          this.snackBar.open('خطأ في تحميل الإعلانات', 'إغلاق', { duration: 3000 });
          this.loading = false;
        }
      });
  }

  onSubmit() {
    console.log('Form valid:', this.abTestForm.valid);
    console.log('Form value:', this.abTestForm.value);
    console.log('Form errors:', this.abTestForm.errors);
    
    if (this.abTestForm.valid && !this.loading) {
      this.loading = true;
      const formValue = this.abTestForm.value;
      
      const endDate = new Date(formValue.endsAtUtc);
      if (endDate <= new Date()) {
        this.snackBar.open('تاريخ الانتهاء يجب أن يكون في المستقبل', 'إغلاق', { duration: 3000 });
        this.loading = false;
        return;
      }

      console.log('Starting A/B test with:', formValue);
      this.adsService.startABTest(formValue.adAId, formValue.adBId, endDate, formValue.testName, formValue.description)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (result) => {
            console.log('A/B test started successfully:', result);
            this.snackBar.open('تم بدء اختبار A/B بنجاح', 'إغلاق', { duration: 3000 });
            this.dialogRef.close(result);
          },
          error: (error) => {
            console.error('Error starting A/B test:', error);
            this.snackBar.open('خطأ في بدء اختبار A/B', 'إغلاق', { duration: 3000 });
            this.loading = false;
          }
        });
    } else {
      console.log('Form is invalid or loading');
      this.snackBar.open('يرجى ملء جميع الحقول المطلوبة', 'إغلاق', { duration: 3000 });
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  getAdTitle(adId: string): string {
    const ad = this.myAds.find(a => a.id === adId);
    return ad ? ad.title : '';
  }

  getAdPrice(adId: string): number {
    const ad = this.myAds.find(a => a.id === adId);
    return ad ? ad.price : 0;
  }

  getAdImages(adId: string): string[] {
    const ad = this.myAds.find(a => a.id === adId);
    return ad ? ad.images || [] : [];
  }

  getErrorMessage(fieldName: string): string {
    const field = this.abTestForm.get(fieldName);
    if (field?.hasError('required')) {
      return 'هذا الحقل مطلوب';
    }
    if (field?.hasError('sameAds')) {
      return 'يجب اختيار إعلانين مختلفين';
    }
    return '';
  }

  hasError(fieldName: string): boolean {
    const field = this.abTestForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  viewAd(adId: string) {
    if (adId) {
      // يمكن فتح الإعلان في نافذة جديدة أو التنقل إليه
      window.open(`/ads/${adId}`, '_blank');
    }
  }
}
