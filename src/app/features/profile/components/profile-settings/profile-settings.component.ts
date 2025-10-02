import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { LucideAngularModule, Save, Camera, User, Mail, Phone, MapPin, Calendar } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { ProfileService } from '../../../../core/services/profile.service';
import { ProfileDto, ProfileUpdateDto } from '../../../../models/profile.models';
import { ImageUrlHelper } from '../../../../core/utils/image-url.helper';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    LucideAngularModule
  ],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  profileForm!: FormGroup;
  currentUser: ProfileDto | null = null;
  isLoading = false;
  isSaving = false;
  selectedImage: File | null = null;
  imagePreview: string | null = null;

  private destroy$ = new Subject<void>();
  private profileService = inject(ProfileService);
  private toastr = inject(ToastrService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);

  ngOnInit() {
    this.initializeForm();
    this.loadProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm() {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: [''],
      address: ['']
    });
  }

  loadProfile() {
    this.isLoading = true;
    
    this.profileService.getProfile().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.currentUser = response.data;
          this.populateForm(response.data);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('فشل في تحميل بيانات الملف الشخصي', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  private populateForm(user: ProfileDto) {
    this.profileForm.patchValue({
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber || '',
      address: user.address || ''
    });
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSaveProfile() {
    if (this.profileForm.valid) {
      this.isSaving = true;
      
      const updateData: ProfileUpdateDto = {
        firstName: this.profileForm.value.firstName,
        lastName: this.profileForm.value.lastName,
        phoneNumber: this.profileForm.value.phoneNumber || undefined,
        address: this.profileForm.value.address || undefined
      };

      this.profileService.updateProfile(updateData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            this.toastr.success('تم حفظ الملف الشخصي بنجاح', 'تم');
          } else {
            this.toastr.error('فشل في حفظ الملف الشخصي', 'خطأ');
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.toastr.error('فشل في حفظ الملف الشخصي', 'خطأ');
          this.isSaving = false;
        }
      });
    } else {
      this.toastr.warning('يرجى ملء جميع الحقول المطلوبة', 'تحذير');
    }
  }

  onUploadImage() {
    if (this.selectedImage) {
      this.isSaving = true;
      
      this.profileService.uploadProfilePhoto(this.selectedImage).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.currentUser = response.data;
            this.imagePreview = null;
            this.selectedImage = null;
            this.toastr.success('تم رفع الصورة بنجاح', 'تم');
          } else {
            this.toastr.error('فشل في رفع الصورة', 'خطأ');
          }
          this.isSaving = false;
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.toastr.error('فشل في رفع الصورة', 'خطأ');
          this.isSaving = false;
        }
      });
    }
  }

  onRemoveImage() {
    this.imagePreview = null;
    this.selectedImage = null;
  }

  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'هذا الحقل مطلوب';
      }
      if (field.errors['minlength']) {
        return 'يجب أن يكون طول النص على الأقل 2 أحرف';
      }
    }
    return '';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getProfileImageUrl(): string {
    return ImageUrlHelper.getProfileImageUrl(this.currentUser?.profileImageUrl);
  }
}