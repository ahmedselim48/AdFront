import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule, User, Mail, Phone, MapPin, Calendar, Star, Eye, MessageCircle } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { PublicProfileService, PublicProfileDto } from '../../../../core/services/public-profile.service';
import { DirectChatService } from '../../../../core/services/direct-chat.service';
import { AdsService } from '../../../../core/services/ads.service';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdDto } from '../../../../models/ads.models';
import { ImageUrlHelper } from '../../../../core/utils/image-url.helper';

@Component({
  selector: 'app-public-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDividerModule,
    MatTooltipModule,
    LucideAngularModule
  ],
  templateUrl: './public-profile.component.html',
  styleUrls: ['./public-profile.component.scss']
})
export class PublicProfileComponent implements OnInit {
  profile: PublicProfileDto | null = null;
  userAds: AdDto[] = [];
  isLoading = false;
  isContacting = false;
  userId: string | null = null;
  isOwnProfile = false;
  private currentUserId: string | null = null;

  private publicProfileService = inject(PublicProfileService);
  private directChatService = inject(DirectChatService);
  private adsService = inject(AdsService);
  private authService = inject(AuthService);
  private toastr = inject(ToastrService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    // react to auth changes to properly detect ownership
    this.authService.currentUser$.subscribe(user => {
      this.currentUserId = user?.id ?? null;
      this.updateOwnershipCheck();
    });

    if (this.userId) {
      this.updateOwnershipCheck();
      this.loadProfile();
      this.loadUserAds();
    } else {
      this.toastr.error('معرف المستخدم غير صحيح', 'خطأ');
      this.router.navigate(['/']);
    }
  }

  private updateOwnershipCheck() {
    const routeId = this.userId;
    const authId = this.currentUserId;
    const profileId = this.profile?.id;
    this.isOwnProfile = Boolean(authId && (authId === routeId || authId === profileId));
  }

  loadProfile() {
    if (!this.userId) return;
    
    this.isLoading = true;
    this.publicProfileService.getPublicProfile(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.profile = response.data;
          this.updateOwnershipCheck();
        } else {
          this.toastr.error('المستخدم غير موجود', 'خطأ');
          this.router.navigate(['/']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.toastr.error('فشل في تحميل الملف الشخصي', 'خطأ');
        this.isLoading = false;
      }
    });
  }

  loadUserAds() {
    if (!this.userId) return;
    
    this.adsService.getAdsByUserId(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userAds = response.data;
        }
      },
      error: (error) => {
        console.error('Error loading user ads:', error);
      }
    });
  }

  onContactUser() {
    if (!this.userId || !this.profile) return;
    
    this.isContacting = true;
    this.directChatService.getOrCreateConversation(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.router.navigate(['/chat', response.data.id]);
        } else {
          this.toastr.error('فشل في إنشاء المحادثة', 'خطأ');
        }
        this.isContacting = false;
      },
      error: (error) => {
        console.error('Error creating conversation:', error);
        this.toastr.error('فشل في إنشاء المحادثة', 'خطأ');
        this.isContacting = false;
      }
    });
  }

  onCallPhone(phoneNumber: string) {
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`, '_self');
    }
  }

  onOpenWhatsApp(whatsappNumber: string) {
    if (whatsappNumber) {
      const message = `مرحباً، أريد التواصل معك بخصوص إعلاناتك`;
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
    }
  }

  onSendEmail(email: string) {
    if (email) {
      const subject = `استفسار حول إعلاناتك`;
      const body = `مرحباً،\n\nأريد التواصل معك بخصوص إعلاناتك\n\nشكراً لك`;
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      window.open(mailtoLink, '_self');
    }
  }

  formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  getAdImage(ad: AdDto): string {
    if (ad.images && ad.images.length > 0) {
      if (typeof ad.images[0] === 'string') {
        return ad.images[0];
      }
      // If images is array of objects
      const firstImage: any = ad.images[0];
      return firstImage.url || firstImage.thumbnailUrl || '/assets/images/placeholder-ad.svg';
    }
    return '/assets/images/placeholder-ad.svg';
  }

  getDisplayName(): string {
    const first = this.profile?.firstName?.trim();
    const last = this.profile?.lastName?.trim();
    const full = (this.profile as any)?.fullName?.trim();
    const name = [first, last].filter(Boolean).join(' ').trim();
    return name || full || '';
  }

  getUsername(): string {
    const username = this.profile?.userName?.trim();
    if (username) return `@${username}`;
    return '';
  }

  onGoHome() {
    this.router.navigate(['/']);
  }

  getProfileImageUrl(profileImageUrl: string | undefined): string {
    return ImageUrlHelper.getProfileImageUrl(profileImageUrl);
  }

  onViewAd(ad: AdDto) {
    this.router.navigate(['/ads', ad.id]);
  }

  // ===== Social helpers =====
  private extractUsername(url: string): string {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      return parts[0] || u.hostname;
    } catch {
      return url;
    }
  }

  getFacebookName(url?: string): string {
    if (!url) return '';
    return this.extractUsername(url);
  }

  getInstagramName(url?: string): string {
    if (!url) return '';
    return this.extractUsername(url);
  }

  getHostname(url?: string): string {
    if (!url) return '';
    try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
  }

  getFacebookAvatar(url?: string): string {
    return 'assets/images/facebook-icon.svg';
  }

  getInstagramAvatar(url?: string): string {
    return 'assets/images/instagram-icon.svg';
  }

  onEditProfile() {
    this.router.navigate(['/profile/settings']);
  }
}
