import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { LucideAngularModule } from 'lucide-angular';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { AuthService } from '../../core/auth/auth.service';
import { UserProfile, UserDashboardDto, UpdateProfileRequest } from '../../models/auth.models';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';
import { ChatService } from '../../core/services/chat.service';
import { Conversation } from '../../models/chat.models';
import { NotificationService } from '../../shared/services/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatBadgeModule,
    LucideAngularModule,
    TranslatePipe
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  ads: AdItem[] = [];
  loadingAds = true;
  loadingChats = true;
  saving = false;
  uploadingImage = false;
  viewMode: 'grid' | 'list' = 'grid';
  filter: 'all' | 'draft' | 'scheduled' | 'active' | 'paused' | 'published' = 'all';
  activeTab: 'profile' | 'ads' | 'chat' = 'profile';
  recentChats: Conversation[] = [];
  unreadMessages = 0;
  dashboardData: UserDashboardDto | null = null;
  selectedImage: File | null = null;
  imagePreview: string | null = null;
  private VIEW_KEY = 'profile_view_mode';
  private FILTER_KEY = 'profile_ads_filter';
  private TAB_KEY = 'profile_active_tab';
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private adsSvc: AdsService, 
    private chatSvc: ChatService,
    private router: Router,
    private notificationService: NotificationService
  ){
    console.log('ProfileComponent constructor called');
    this.form = this.fb.group({ 
      id: [''], 
      email: [''], 
      firstName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]], 
      lastName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]], 
      phoneNumber: ['', [Validators.pattern(/^[\+]?[0-9\s\-\(\)]{10,}$/)]],
      address: ['', [Validators.maxLength(200)]],
      plan: ['free', Validators.required] 
    });
    
    // restore persisted UI state
    this.viewMode = (localStorage.getItem(this.VIEW_KEY) as 'grid'|'list') ?? 'grid';
    this.filter = (localStorage.getItem(this.FILTER_KEY) as typeof this.filter) ?? 'all';
    this.activeTab = (localStorage.getItem(this.TAB_KEY) as typeof this.activeTab) ?? 'profile';
  }

  ngOnInit() {
    console.log('ProfileComponent initialized');
    // Use safe loading with error handling
    try {
      this.loadProfile();
      this.loadAds();
      this.loadChats();
      this.loadUnreadCount();
    } catch (error) {
      console.error('Error in ngOnInit:', error);
    }
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  // Load methods
  private loadProfile() {
    // Use dashboard data for more comprehensive profile information
    const sub = this.auth.getMyDashboard().subscribe({
      next: (dashboard: UserDashboardDto) => {
        // Map dashboard data to form
        this.form.patchValue({
          id: dashboard.id,
          email: dashboard.email,
          firstName: dashboard.firstName || '',
          lastName: dashboard.lastName || '',
          phoneNumber: dashboard.phoneNumber || '',
          address: dashboard.address || '',
          plan: dashboard.subscriptionStatus?.hasActive ? 'pro' : 'free'
        });
        
        // Store additional dashboard data for display
        this.dashboardData = dashboard;
        
        // Set image preview if available
        if (dashboard.profileImageUrl) {
          // Ensure the URL is complete with base URL
          this.imagePreview = this.getFullImageUrl(dashboard.profileImageUrl);
          console.log('Profile image URL:', dashboard.profileImageUrl);
          console.log('Full image URL:', this.imagePreview);
        }
      },
      error: (error) => {
        console.log('Profile load error, using mock data:', error);
        // Use mock data for testing without authentication
        this.dashboardData = {
          id: 'mock-user-1',
          userName: 'testuser',
          email: 'test@example.com',
          firstName: 'اختبار',
          lastName: 'المستخدم',
          fullName: 'اختبار المستخدم',
          phoneNumber: '0501234567',
          address: 'الرياض، السعودية',
          profileImageUrl: undefined,
          isEmailConfirmed: true,
          isActive: true,
          createdAt: new Date().toISOString(),
          roles: ['User'],
          totalAds: 5,
          activeAds: 3,
          totalViews: 150,
          totalClicks: 25,
          subscriptionStatus: {
            hasActive: true,
            daysRemaining: 30,
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        };
        
        this.form.patchValue({
          id: this.dashboardData.id,
          email: this.dashboardData.email,
          firstName: this.dashboardData.firstName || '',
          lastName: this.dashboardData.lastName || '',
          phoneNumber: this.dashboardData.phoneNumber || '',
          address: this.dashboardData.address || '',
          plan: this.dashboardData.subscriptionStatus?.hasActive ? 'pro' : 'free'
        });
      }
    });
    this.subscriptions.push(sub);
  }

  private loadAds() {
    const sub = this.adsSvc.list().subscribe({ 
      next: (list) => { 
        this.ads = list; 
        this.loadingAds = false; 
      }, 
      error: (error) => { 
        this.loadingAds = false;
        console.log('Ads load error, using mock data:', error);
        // Use mock ads for testing
        this.ads = [
          {
            id: '1',
            title: 'iPhone 14 Pro Max',
            description: 'Mint condition, 256GB, Space Black',
            location: 'الرياض',
            price: 4200,
            status: 'Published' as any,
            createdAt: new Date(),
            viewsCount: 25,
            clicksCount: 5,
            likesCount: 12,
            commentsCount: 3,
            userName: 'اختبار المستخدم',
            images: ['/assets/iphone.jpg'],
            keywords: ['iPhone', 'mobile'],
            isAIGenerated: false
          }
        ];
      } 
    });
    this.subscriptions.push(sub);
  }

  private loadChats() {
    const sub = this.chatSvc.getConversations().subscribe({
      next: (conversations) => {
        this.recentChats = conversations.data.slice(0, 5); // Show only recent 5 chats
        this.loadingChats = false;
      },
      error: (error) => {
        this.loadingChats = false;
        console.log('Chats load error, using empty array:', error);
        this.recentChats = [];
      }
    });
    this.subscriptions.push(sub);
  }

  private loadUnreadCount() {
    const sub = this.chatSvc.getUnreadDirectMessageCount().subscribe({
      next: (result) => {
        this.unreadMessages = result.data || 0;
      },
      error: (error) => {
        console.log('Unread count load error:', error);
        this.unreadMessages = 0;
      }
    });
    this.subscriptions.push(sub);
  }

  // Form validation
  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;

    switch (fieldName) {
      case 'firstName':
      case 'lastName':
        if (errors['required']) return 'هذا الحقل مطلوب';
        if (errors['minlength']) return 'يجب أن يكون حرفين على الأقل';
        if (errors['maxlength']) return 'يجب أن يكون أقل من 50 حرف';
        break;
      case 'phoneNumber':
        if (errors['pattern']) return 'رقم الهاتف غير صحيح';
        break;
      case 'address':
        if (errors['maxlength']) return 'العنوان طويل جداً';
        break;
    }

    return '';
  }

  hasFieldError(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.errors && field.touched);
  }

  hasFieldSuccess(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    if (!field || !field.touched || !field.value) return false;
    
    return !field.errors && field.value.length > 0 && field.dirty;
  }

  getFieldStatus(fieldName: string): string {
    if (this.hasFieldError(fieldName)) return 'error';
    if (this.hasFieldSuccess(fieldName)) return 'success';
    return '';
  }

  // Save profile
  save(){ 
    if(this.form.invalid) return;
    this.saving = true;
    
    const updateRequest: UpdateProfileRequest = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      phoneNumber: this.form.value.phoneNumber,
      address: this.form.value.address
    };

    const sub = this.auth.updateProfileViaDashboard(updateRequest).subscribe({
      next: (profile) => {
        this.saving = false;
        console.log('Profile updated successfully:', profile);
        // Show success message
        this.showSuccessMessage('تم حفظ البيانات بنجاح');
      },
      error: (error) => {
        this.saving = false;
        console.error('Profile update error:', error);
        this.showErrorMessage('فشل في حفظ البيانات');
      }
    });
    
    this.subscriptions.push(sub);
  }

  // Image upload methods
  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.showErrorMessage('يرجى اختيار ملف صورة صحيح');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.showErrorMessage('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
        return;
      }

      this.selectedImage = file;
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadImage(): void {
    if (!this.selectedImage) return;

    this.uploadingImage = true;
    
    const sub = this.auth.uploadProfileImage(this.selectedImage).subscribe({
      next: (profile) => {
        this.uploadingImage = false;
        this.selectedImage = null;
        this.imagePreview = profile.profileImageUrl ? this.getFullImageUrl(profile.profileImageUrl) : null;
        this.showSuccessMessage('تم رفع الصورة بنجاح');
        
        // Update dashboard data
        if (this.dashboardData) {
          this.dashboardData.profileImageUrl = profile.profileImageUrl;
        }
      },
      error: (error) => {
        this.uploadingImage = false;
        console.error('Image upload error:', error);
        this.showErrorMessage('فشل في رفع الصورة');
      }
    });
    
    this.subscriptions.push(sub);
  }

  removeImage(): void {
    if (this.selectedImage) {
      // If there's a selected image that hasn't been uploaded yet
      this.selectedImage = null;
      this.imagePreview = this.dashboardData?.profileImageUrl || null;
    } else if (this.imagePreview) {
      // If there's an uploaded image, delete it from server
      this.uploadingImage = true;
      
      const sub = this.auth.deleteProfileImage().subscribe({
        next: () => {
          this.uploadingImage = false;
          this.imagePreview = null;
          this.showSuccessMessage('تم حذف الصورة بنجاح');
          
          // Update dashboard data
          if (this.dashboardData) {
            this.dashboardData.profileImageUrl = undefined;
          }
        },
        error: (error) => {
          this.uploadingImage = false;
          console.error('Image delete error:', error);
          this.showErrorMessage('فشل في حذف الصورة');
        }
      });
      
      this.subscriptions.push(sub);
    }
  }

  // Helper methods
  private getFullImageUrl(relativeUrl: string): string {
    if (!relativeUrl) return '';
    
    // If it's already a full URL, return as is
    if (relativeUrl.startsWith('http')) {
      return relativeUrl;
    }
    
    // If it starts with /, it's a relative URL from the backend
    if (relativeUrl.startsWith('/')) {
      return `http://localhost:5254${relativeUrl}`;
    }
    
    // Otherwise, assume it's a relative path
    return `http://localhost:5254/${relativeUrl}`;
  }

  onImageError(event: any): void {
    console.error('Image load error:', event);
    // Hide the image and show the fallback
    this.imagePreview = null;
    this.showErrorMessage('فشل في تحميل الصورة');
  }

  // Message display methods
  private showSuccessMessage(message: string): void {
    this.notificationService.showSuccess(message);
  }

  private showErrorMessage(message: string): void {
    this.notificationService.showError(message);
  }

  // Tab management
  setActiveTab(tab: 'profile' | 'ads' | 'chat') {
    this.activeTab = tab;
    localStorage.setItem(this.TAB_KEY, tab);
  }

  // Ads management
  get filteredAds(): AdItem[] {
    if(this.filter === 'all') return this.ads;
    // map filter values to actual status values
    const statusMap: Record<string, string> = {
      'draft': 'Draft',
      'scheduled': 'Pending', 
      'active': 'Published',
      'paused': 'Archived',
      'published': 'Published'
    };
    const status = statusMap[this.filter] || this.filter;
    return this.ads.filter(a => a.status === status);
  }

  setView(mode: 'grid'|'list'){ 
    this.viewMode = mode; 
    localStorage.setItem(this.VIEW_KEY, mode); 
  }
  
  setFilter(f: 'all'|'draft'|'scheduled'|'active'|'paused'|'published'){ 
    this.filter = f; 
    localStorage.setItem(this.FILTER_KEY, f); 
  }

  get counts(){
    const c: Record<string, number> = { all: this.ads.length, draft: 0, scheduled: 0, active: 0, paused: 0, published: 0 };
    for(const a of this.ads){
      if(a.status === 'Draft') c['draft']++;
      else if(a.status === 'Pending') c['scheduled']++;
      else if(a.status === 'Published') { c['active']++; c['published']++; }
      else if(a.status === 'Archived') c['paused']++;
    }
    return c;
  }

  get totalAds(): number {
    return this.dashboardData?.totalAds || this.ads.length;
  }

  get activeAds(): number {
    return this.dashboardData?.activeAds || this.ads.filter(ad => ad.status === 'Published').length;
  }

  get totalViews(): number {
    return this.dashboardData?.totalViews || 0;
  }

  get totalClicks(): number {
    return this.dashboardData?.totalClicks || 0;
  }

  get isEmailConfirmed(): boolean {
    return this.dashboardData?.isEmailConfirmed || false;
  }

  get memberSince(): string {
    return this.dashboardData?.createdAt || '';
  }

  get phoneNumber(): string {
    return this.dashboardData?.phoneNumber || '';
  }

  get address(): string {
    return this.dashboardData?.address || '';
  }

  get profileImageUrl(): string {
    return this.dashboardData?.profileImageUrl || '';
  }

  editAd(ad: AdItem){
    localStorage.setItem('edit_ad', JSON.stringify(ad));
    this.router.navigate(['/ads']);
  }

  deleteAd(ad: AdItem){
    if(!confirm('Delete this ad?')) return;
    this.adsSvc.remove(ad.id).subscribe({
      next: () => { this.ads = this.ads.filter(a => a.id !== ad.id); },
      error: () => {}
    });
  }
   goToAddAd() {
    this.router.navigate(['/adscreate']); // هتروح على كومبوننت إضافة إعلان
  }
}
