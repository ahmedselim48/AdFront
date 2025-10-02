import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
// import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { AdsService } from '../../ads.service';
import { AdItem, CommentDto, AdPerformanceDto } from '../../../../models/ads.models';
import { AuthService } from '../../../../core/auth/auth.service';
import { DirectChatService } from '../../../../core/services/direct-chat.service';
import { ContactHelperService } from '../../../../core/services/contact-helper.service';

@Component({
  selector: 'app-ad-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss']
})
export class AdDetailsComponent implements OnInit, OnDestroy {
  ad: AdItem | null = null;
  comments: CommentDto[] = [];
  performance: AdPerformanceDto | null = null;
  loading = false;
  commentsLoading = false;
  performanceLoading = false;
  commentForm!: FormGroup;
  isOwner = false;
  showAnalytics = false;
  isLiked = false;
  
  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adsService = inject(AdsService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);
  private directChatService = inject(DirectChatService);
  private contactHelper = inject(ContactHelperService);

  ngOnInit() {
    this.initializeCommentForm();
    this.loadAd();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeCommentForm() {
    this.commentForm = this.fb.group({
      content: ['', [Validators.required, Validators.maxLength(1000)]]
    });
  }

  loadAd() {
    const adId = this.route.snapshot.paramMap.get('id');
    if (!adId || adId === 'undefined' || adId === 'null') {
      console.error('Invalid ad ID:', adId);
      this.loading = false;
      return;
    }

    this.loading = true;
    this.adsService.getById(adId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (ad) => {
        console.log('Ad data loaded:', ad);
        this.ad = ad;
        this.isOwner = this.authService.getCurrentUser()?.id === ad.userId;
        this.showAnalytics = this.isOwner; // Show analytics only for owners
        this.loadComments();
        this.loadPerformance();
        this.recordView();
        this.checkLikeStatus();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading ad:', error);
        this.loading = false;
      }
    });
  }

  loadComments() {
    if (!this.ad || !this.ad.id || this.ad.id === 'undefined') return;

    this.commentsLoading = true;
    this.adsService.getComments(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.commentsLoading = false;
      },
      error: (error) => {
        console.error('Error loading comments:', error);
        this.commentsLoading = false;
      }
    });
  }

  loadPerformance() {
    if (!this.ad || !this.isOwner) return;

    this.performanceLoading = true;
    this.adsService.getAnalytics(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (performance) => {
        this.performance = performance;
        this.performanceLoading = false;
      },
      error: (error) => {
        console.error('Error loading performance:', error);
        this.performanceLoading = false;
      }
    });
  }

  recordView() {
    if (!this.ad || !this.ad.id || this.ad.id === 'undefined') return;

    this.adsService.view(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        if (this.ad) this.ad.viewsCount++;
      },
      error: (error) => {
        console.error('Error recording view:', error);
      }
    });
  }

  addComment() {
    if (this.commentForm.invalid || !this.ad) return;

    const content = this.commentForm.get('content')?.value;
    this.adsService.addComment(this.ad.id, content).pipe(takeUntil(this.destroy$)).subscribe({
      next: (comment) => {
        this.comments.push(comment);
        this.commentForm.reset();
        if (this.ad) this.ad.commentsCount++;
      },
      error: (error) => {
        console.error('Error adding comment:', error);
      }
    });
  }

  deleteComment(comment: CommentDto) {
    if (confirm('Are you sure you want to delete this comment?')) {
      this.adsService.deleteComment(comment.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.comments = this.comments.filter(c => c.id !== comment.id);
          if (this.ad) this.ad.commentsCount--;
        },
        error: (error) => {
          console.error('Error deleting comment:', error);
        }
      });
    }
  }

  toggleLike() {
    if (!this.ad) return;

    if (this.isLiked) {
      // Unlike the ad
      this.adsService.unlike(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.ad!.likesCount--;
          this.isLiked = false;
        },
        error: (error) => {
          console.error('Error unliking ad:', error);
        }
      });
    } else {
      // Like the ad
      this.adsService.like(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.ad!.likesCount++;
          this.isLiked = true;
        },
        error: (error) => {
          console.error('Error liking ad:', error);
        }
      });
    }
  }

  likeAd() {
    if (!this.isLiked) {
      this.toggleLike();
    }
  }

  unlikeAd() {
    if (this.isLiked) {
      this.toggleLike();
    }
  }

  private checkLikeStatus() {
    if (!this.ad || !this.authService.getCurrentUser()) return;
    
    this.adsService.checkIfLiked(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
      next: (isLiked) => {
        this.isLiked = isLiked;
      },
      error: (error) => {
        console.error('Error checking like status:', error);
        this.isLiked = false;
      }
    });
  }

  calculateCTR(): number {
    if (!this.ad || !this.ad.viewsCount || this.ad.viewsCount === 0) return 0;
    return (this.ad.clicksCount || 0) / this.ad.viewsCount * 100;
  }

  editAd() {
    if (!this.ad) return;
    this.router.navigate(['/ads', this.ad.id, 'edit']);
  }

  deleteAd() {
    if (!this.ad) return;

    if (confirm('Are you sure you want to delete this ad?')) {
      this.adsService.remove(this.ad.id).pipe(takeUntil(this.destroy$)).subscribe({
        next: () => {
          this.router.navigate(['/ads']);
        },
        error: (error) => {
          console.error('Error deleting ad:', error);
        }
      });
    }
  }

  toggleAnalytics() {
    this.showAnalytics = !this.showAnalytics;
    if (this.showAnalytics && !this.performance) {
      this.loadPerformance();
    }
  }

  contactSeller() {
    if (!this.ad || !this.ad.userId) {
      console.error('Ad or seller information not available');
      return;
    }

    // Check if user is logged in
    const currentUser = this.authService.currentUser;
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Navigate to direct chat with the seller
    this.router.navigate(['/profile/messages'], { 
      queryParams: { 
        userId: this.ad.userId,
        adId: this.ad.id,
        adTitle: this.ad.title
      } 
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR'
    }).format(price);
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return 'غير محدد';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'تاريخ غير صحيح';
      
      return new Intl.DateTimeFormat('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'تاريخ غير صحيح';
    }
  }

  // Contact helper methods
  formatPhoneNumber(phoneNumber: string): string {
    return this.contactHelper.formatPhoneNumber(phoneNumber);
  }

  getContactMethodLabel(method?: 'Call' | 'WhatsApp'): string {
    switch (method) {
      case 'Call':
        return 'اتصال';
      case 'WhatsApp':
        return 'واتساب';
      default:
        return 'اتصال أو واتساب';
    }
  }

  openWhatsApp(): void {
    if (!this.ad?.contactNumber) {
      console.error('Contact number not available');
      return;
    }
    
    this.contactHelper.openContact('WhatsApp', this.ad.contactNumber, this.ad.title);
  }

  makeCall(): void {
    if (!this.ad?.contactNumber) {
      console.error('Contact number not available');
      return;
    }
    
    this.contactHelper.openContact('Call', this.ad.contactNumber);
  }
}