import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { ProfileService } from '../../core/services/profile.service';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile, UpdateProfileRequest, SubscriptionStatus } from '../../models/auth.models';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  template: `
    <div class="profile-container">
      <div class="profile-header">
        <h2>{{ 'profile.title' | t }}</h2>
        <p>{{ 'profile.subtitle' | t }}</p>
      </div>

      <div *ngIf="loading" class="loading">
        <div class="spinner"></div>
        <span>{{ 'common.loading' | t }}</span>
      </div>

      <div *ngIf="error" class="error-message">
        {{ error }}
      </div>

      <div *ngIf="success" class="success-message">
        {{ success }}
      </div>

      <div *ngIf="profile && !loading" class="profile-content">
        <!-- Profile Information -->
        <div class="profile-section">
          <h3>{{ 'profile.personalInfo' | t }}</h3>
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="form-row">
              <div class="form-group">
                <label>{{ 'profile.firstName' | t }}</label>
                <input 
                  type="text" 
                  formControlName="firstName"
                  [class]="'field-input ' + getFieldStatus('firstName')"
                  placeholder="{{ 'profile.firstNamePlaceholder' | t }}">
                <div *ngIf="hasFieldError('firstName')" class="error">
                  {{ getFieldError('firstName') }}
                </div>
              </div>
              
              <div class="form-group">
                <label>{{ 'profile.lastName' | t }}</label>
                <input 
                  type="text" 
                  formControlName="lastName"
                  [class]="'field-input ' + getFieldStatus('lastName')"
                  placeholder="{{ 'profile.lastNamePlaceholder' | t }}">
                <div *ngIf="hasFieldError('lastName')" class="error">
                  {{ getFieldError('lastName') }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>{{ 'profile.phoneNumber' | t }}</label>
              <input 
                type="tel" 
                formControlName="phoneNumber"
                [class]="'field-input ' + getFieldStatus('phoneNumber')"
                placeholder="{{ 'profile.phoneNumberPlaceholder' | t }}">
              <div *ngIf="hasFieldError('phoneNumber')" class="error">
                {{ getFieldError('phoneNumber') }}
              </div>
            </div>

            <div class="form-group">
              <label>{{ 'profile.email' | t }}</label>
              <input 
                type="email" 
                [value]="profile.email"
                disabled
                class="field-input disabled">
              <small class="help-text">{{ 'profile.emailHelp' | t }}</small>
            </div>

            <div class="form-group">
              <label>{{ 'profile.userName' | t }}</label>
              <input 
                type="text" 
                [value]="profile.userName"
                disabled
                class="field-input disabled">
              <small class="help-text">{{ 'profile.userNameHelp' | t }}</small>
            </div>

            <button type="submit" [disabled]="profileForm.invalid || updating" class="btn-primary">
              <span *ngIf="updating">{{ 'common.saving' | t }}</span>
              <span *ngIf="!updating">{{ 'profile.updateProfile' | t }}</span>
            </button>
          </form>
        </div>

        <!-- Profile Image -->
        <div class="profile-section">
          <h3>{{ 'profile.profileImage' | t }}</h3>
          <div class="profile-image-container">
            <div class="current-image">
              <img 
                *ngIf="profile.profileImageUrl" 
                [src]="profile.profileImageUrl" 
                [alt]="profile.fullName"
                class="profile-image">
              <div *ngIf="!profile.profileImageUrl" class="no-image">
                <i class="icon-user"></i>
              </div>
            </div>
            <div class="image-actions">
              <input 
                type="file" 
                #fileInput 
                accept="image/*" 
                (change)="onImageSelected($event)"
                style="display: none;">
              <button type="button" (click)="fileInput.click()" class="btn-secondary">
                {{ 'profile.changeImage' | t }}
              </button>
              <button 
                *ngIf="profile.profileImageUrl" 
                type="button" 
                (click)="removeImage()" 
                class="btn-danger">
                {{ 'profile.removeImage' | t }}
              </button>
            </div>
          </div>
        </div>

        <!-- Account Status -->
        <div class="profile-section">
          <h3>{{ 'profile.accountStatus' | t }}</h3>
          <div class="status-grid">
            <div class="status-item">
              <span class="status-label">{{ 'profile.emailConfirmed' | t }}</span>
              <span class="status-value" [class.confirmed]="profile.isEmailConfirmed">
                {{ profile.isEmailConfirmed ? ('profile.yes' | t) : ('profile.no' | t) }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ 'profile.accountActive' | t }}</span>
              <span class="status-value" [class.active]="profile.isActive">
                {{ profile.isActive ? ('profile.yes' | t) : ('profile.no' | t) }}
              </span>
            </div>
            <div class="status-item">
              <span class="status-label">{{ 'profile.memberSince' | t }}</span>
              <span class="status-value">{{ profile.createdAt | date:'medium' }}</span>
            </div>
          </div>
        </div>

        <!-- Subscription Status -->
        <div class="profile-section" *ngIf="subscriptionStatus">
          <h3>{{ 'profile.subscription' | t }}</h3>
          <div class="subscription-card" [class.active]="subscriptionStatus.hasActive">
            <div class="subscription-info">
              <h4>{{ subscriptionStatus.hasActive ? ('profile.subscriptionActive' | t) : ('profile.subscriptionInactive' | t) }}</h4>
              <p *ngIf="subscriptionStatus.hasActive && subscriptionStatus.daysRemaining">
                {{ 'profile.daysRemaining' | t }}: {{ subscriptionStatus.daysRemaining }}
              </p>
              <p *ngIf="subscriptionStatus.endDate">
                {{ 'profile.expiresOn' | t }}: {{ subscriptionStatus.endDate | date:'medium' }}
              </p>
            </div>
            <button *ngIf="!subscriptionStatus.hasActive" class="btn-primary">
              {{ 'profile.upgradeSubscription' | t }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .profile-header h2 {
      color: var(--text);
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .profile-header p {
      color: var(--muted);
      font-size: 1.1rem;
    }

    .profile-content {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .profile-section {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 1.5rem;
    }

    .profile-section h3 {
      color: var(--text);
      font-size: 1.25rem;
      margin-bottom: 1rem;
      border-bottom: 2px solid var(--brand);
      padding-bottom: 0.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 500;
      color: var(--text);
    }

    .field-input {
      padding: 0.75rem 1rem;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--surface);
      color: var(--text);
      font-size: 1rem;
      transition: all 0.2s ease;
    }

    .field-input:focus {
      outline: none;
      border-color: var(--brand);
      box-shadow: 0 0 0 3px rgba(0, 102, 255, 0.1);
    }

    .field-input.error {
      border-color: var(--danger);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .field-input.success {
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
    }

    .field-input.disabled {
      background: var(--muted-bg);
      color: var(--muted);
      cursor: not-allowed;
    }

    .help-text {
      color: var(--muted);
      font-size: 0.875rem;
    }

    .error {
      color: var(--danger);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .btn-primary, .btn-secondary, .btn-danger {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      border: none;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-top: 1rem;
    }

    .btn-primary {
      background: var(--gradient);
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 102, 255, 0.3);
    }

    .btn-secondary {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
    }

    .btn-secondary:hover {
      background: var(--muted-bg);
    }

    .btn-danger {
      background: var(--danger);
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .profile-image-container {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .current-image {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid var(--border);
    }

    .profile-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .no-image {
      width: 100%;
      height: 100%;
      background: var(--muted-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--muted);
      font-size: 2rem;
    }

    .image-actions {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .status-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .status-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--muted-bg);
      border-radius: 8px;
    }

    .status-label {
      font-weight: 500;
      color: var(--text);
    }

    .status-value {
      font-weight: 600;
      color: var(--muted);
    }

    .status-value.confirmed,
    .status-value.active {
      color: var(--accent);
    }

    .subscription-card {
      padding: 1.5rem;
      border: 2px solid var(--border);
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .subscription-card.active {
      border-color: var(--accent);
      background: rgba(34, 197, 94, 0.05);
    }

    .subscription-info h4 {
      color: var(--text);
      margin-bottom: 0.5rem;
    }

    .subscription-info p {
      color: var(--muted);
      margin: 0;
    }

    .loading {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 2rem;
      color: var(--text);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border);
      border-top: 2px solid var(--brand);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-message {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    .success-message {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      text-align: center;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 768px) {
      .profile-container {
        padding: 1rem;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .profile-image-container {
        flex-direction: column;
        text-align: center;
      }

      .subscription-card {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
    }
  `]
})
export class ProfileManagementComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  profileForm!: FormGroup;
  profile: UserProfile | null = null;
  subscriptionStatus: SubscriptionStatus | null = null;
  
  loading = false;
  updating = false;
  error = '';
  success = '';

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private authService: AuthService
  ) {
    this.initializeForm();
  }

  ngOnInit(): void {
    this.loadProfile();
    this.loadSubscriptionStatus();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', [Validators.pattern(/^[0-9+\-\s()]+$/)]]
    });
  }

  private loadProfile(): void {
    this.loading = true;
    this.error = '';

    this.profileService.getProfile()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.profile = response.data;
            this.profileForm.patchValue({
              firstName: response.data.firstName,
              lastName: response.data.lastName,
              phoneNumber: response.data.phoneNumber || ''
            });
          }
          this.loading = false;
        },
        error: (error) => {
          this.loading = false;
          this.error = 'فشل في تحميل بيانات الملف الشخصي';
          console.error('Profile load error:', error);
        }
      });
  }

  private loadSubscriptionStatus(): void {
    this.profileService.getSubscriptionStatus()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.subscriptionStatus = response.data;
          }
        },
        error: (error) => {
          console.error('Subscription status load error:', error);
        }
      });
  }

  updateProfile(): void {
    if (this.profileForm.invalid) return;

    this.updating = true;
    this.error = '';
    this.success = '';

    const updateRequest: UpdateProfileRequest = {
      firstName: this.profileForm.get('firstName')?.value,
      lastName: this.profileForm.get('lastName')?.value,
      phoneNumber: this.profileForm.get('phoneNumber')?.value || undefined
    };

    this.profileService.updateProfile(updateRequest)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response && response.success && response.data) {
            this.profile = response.data;
          }
          this.updating = false;
          this.success = 'تم تحديث الملف الشخصي بنجاح';
        },
        error: (error) => {
          this.updating = false;
          this.error = 'فشل في تحديث الملف الشخصي';
          console.error('Profile update error:', error);
        }
      });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.error = 'يرجى اختيار ملف صورة صحيح';
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      this.error = 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت';
      return;
    }

    this.profileService.uploadProfileImage(file)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response && response.success && response.data && this.profile) {
            this.profile.profileImageUrl = response.data.profileImageUrl;
          }
          this.success = 'تم تحديث صورة الملف الشخصي بنجاح';
        },
        error: (error: any) => {
          this.error = 'فشل في تحديث صورة الملف الشخصي';
          console.error('Image upload error:', error);
        }
      });
  }

  removeImage(): void {
    this.profileService.deleteProfileImage()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          if (this.profile) {
            this.profile.profileImageUrl = undefined;
          }
          this.success = 'تم حذف صورة الملف الشخصي بنجاح';
        },
        error: (error: any) => {
          this.error = 'فشل في حذف صورة الملف الشخصي';
          console.error('Image delete error:', error);
        }
      });
  }

  // Form validation helpers
  getFieldError(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (errors['required']) return 'هذا الحقل مطلوب';
        if (errors['minlength']) return 'يجب أن يكون حرفين على الأقل';
        break;
      case 'phoneNumber':
        if (errors['pattern']) return 'رقم الهاتف غير صحيح';
        break;
    }

    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.profileForm.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  getFieldStatus(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (!field || !field.touched) return '';
    
    if (field.errors) return 'error';
    if (field.value && !field.errors) return 'success';
    return '';
  }
}
