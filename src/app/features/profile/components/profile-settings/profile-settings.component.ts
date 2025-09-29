import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { LucideAngularModule, User, Mail, Phone, MapPin, Calendar, Save } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { UserProfile, ProfileUpdateRequest, UpdateProfileRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatCheckboxModule,
    MatDividerModule,
    LucideAngularModule
  ],
  templateUrl: './profile-settings.component.html',
  styleUrls: ['./profile-settings.component.scss']
})
export class ProfileSettingsComponent implements OnInit, OnDestroy {
  profileForm: FormGroup;
  currentUser: UserProfile | null = null;
  isLoading = false;
  isSaving = false;

  // Language options
  languages = [
    { value: 'ar', label: 'العربية' },
    { value: 'en', label: 'English' }
  ];

  // Timezone options
  timezones = [
    { value: 'Asia/Riyadh', label: 'الرياض (GMT+3)' },
    { value: 'Asia/Dubai', label: 'دبي (GMT+4)' },
    { value: 'Asia/Kuwait', label: 'الكويت (GMT+3)' },
    { value: 'Asia/Qatar', label: 'قطر (GMT+3)' }
  ];

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.profileForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: [''],
      location: [''],
      language: ['ar'],
      timezone: ['Asia/Riyadh'],
      bio: [''],
      website: [''],
      socialLinks: this.fb.group({
        twitter: [''],
        instagram: [''],
        linkedin: [''],
        facebook: ['']
      }),
      preferences: this.fb.group({
        emailNotifications: [true],
        smsNotifications: [false],
        pushNotifications: [true],
        marketingEmails: [false],
        weeklyDigest: [true]
      })
    });
  }

  ngOnInit() {
    this.loadUserProfile();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadUserProfile() {
    this.isLoading = true;

    this.authService.currentUser$.pipe(takeUntil(this.destroy$)).subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.populateForm(user);
      }
      this.isLoading = false;
    });
  }

  populateForm(user: UserProfile) {
    this.profileForm.patchValue({
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      location: '', // This might come from user preferences
      language: 'ar', // Default language
      timezone: 'Asia/Riyadh', // Default timezone
      bio: '', // This might come from user preferences
      website: '', // This might come from user preferences
      socialLinks: {
        twitter: '',
        instagram: '',
        linkedin: '',
        facebook: ''
      },
      preferences: {
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        marketingEmails: false,
        weeklyDigest: true
      }
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      this.isSaving = true;

      const updateRequest: UpdateProfileRequest = {
        firstName: this.profileForm.get('fullName')?.value?.split(' ')[0] || '',
        lastName: this.profileForm.get('fullName')?.value?.split(' ')[1] || '',
        phoneNumber: this.profileForm.get('phoneNumber')?.value
      };

      this.authService.updateProfile(updateRequest).subscribe({
        next: (profile: UserProfile) => {
          this.isSaving = false;
          this.toastr.success('تم تحديث الملف الشخصي بنجاح', 'تم');
          // The auth service will automatically update the current user
        },
        error: (error: any) => {
          this.isSaving = false;
          this.toastr.error('حدث خطأ أثناء تحديث الملف الشخصي', 'خطأ');
          console.error('Error updating profile:', error);
        }
      });
    } else {
      this.profileForm.markAllAsTouched();
      this.toastr.error('يرجى ملء جميع الحقول المطلوبة', 'خطأ');
    }
  }

  onReset() {
    if (this.currentUser) {
      this.populateForm(this.currentUser);
      this.toastr.info('تم إعادة تعيين النموذج', 'تم');
    }
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
