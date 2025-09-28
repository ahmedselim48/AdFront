import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, Heart, Eye, MessageSquare, Share, MapPin, Calendar, User, MoreVertical, Edit, Trash2, Phone, Mail, Flag, Zap } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { AdsService } from '../../../../core/services/ads.service';
import { AdDto, CommentDto } from '../../../../models/ads.models';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-ad-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    LucideAngularModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './ad-details.component.html',
  styleUrls: ['./ad-details.component.scss']
})
export class AdDetailsComponent implements OnInit, OnDestroy {
  ad: AdDto | null = null;
  comments: CommentDto[] = [];
  isLoading = false;
  isLoadingComments = false;
  error = '';
  
  // Image gallery
  currentImageIndex = 0;
  
  // Comments
  newComment = '';
  isSubmittingComment = false;
  
  // Related ads
  relatedAds: AdDto[] = [];
  isLoadingRelated = false;

  private destroy$ = new Subject<void>();

  // Inject services using inject() function
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private adsService = inject(AdsService);
  private toastr = inject(ToastrService);
  private dialog = inject(MatDialog);

  ngOnInit() {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const adId = params['id'];
      if (adId) {
        this.loadAdDetails(adId);
        this.loadComments(adId);
        this.loadRelatedAds(adId);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAdDetails(adId: string) {
    this.isLoading = true;
    this.error = '';

    this.adsService.getById(adId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.ad = response.data;
          // Track view
          this.adsService.incrementView(adId).subscribe({
            next: () => {
              if (this.ad) {
                this.ad.viewsCount++;
              }
            },
            error: (error) => {
              console.error('Error tracking view:', error);
            }
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'حدث خطأ أثناء تحميل تفاصيل الإعلان';
        this.toastr.error('حدث خطأ أثناء تحميل الإعلان', 'خطأ');
        console.error('Error loading ad details:', error);
      }
    });
  }

  loadComments(adId: string) {
    this.isLoadingComments = true;

    this.adsService.getComments(adId).subscribe({
      next: (response) => {
        this.isLoadingComments = false;
        if (response.success && response.data) {
          this.comments = response.data;
        }
      },
      error: (error) => {
        this.isLoadingComments = false;
        console.error('Error loading comments:', error);
      }
    });
  }

  loadRelatedAds(adId: string) {
    this.isLoadingRelated = true;

    // Load related ads based on category
    if (this.ad?.categoryId) {
      this.adsService.getByCategory(this.ad.categoryId).subscribe({
        next: (response) => {
          this.isLoadingRelated = false;
          if (response.success && response.data) {
            // Filter out current ad and limit to 4
            this.relatedAds = response.data
              .filter(ad => ad.id !== adId)
              .slice(0, 4);
          }
        },
        error: (error) => {
          this.isLoadingRelated = false;
          console.error('Error loading related ads:', error);
        }
      });
    }
  }

  onLike() {
    if (!this.ad) return;

    this.adsService.likeAd(this.ad.id).subscribe({
      next: () => {
        this.ad!.likesCount++;
        this.toastr.success('تم إضافة الإعجاب', 'تم');
      },
      error: (error) => {
        this.toastr.error('حدث خطأ أثناء إضافة الإعجاب', 'خطأ');
      }
    });
  }

  onShare() {
    if (!this.ad) return;

    if (navigator.share) {
      navigator.share({
        title: this.ad.title,
        text: this.ad.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      this.toastr.success('تم نسخ رابط الإعلان', 'تم');
    }
  }

  onReport() {
    // Implement report functionality
    this.toastr.info('تم الإبلاغ عن الإعلان', 'تم');
  }

  onSubmitComment() {
    if (!this.newComment.trim() || !this.ad) return;

    this.isSubmittingComment = true;

    this.adsService.addComment(this.ad.id, this.newComment.trim()).subscribe({
      next: (response) => {
        this.isSubmittingComment = false;
        if (response.success && response.data) {
          this.comments.unshift(response.data);
          this.ad!.commentsCount++;
          this.newComment = '';
          this.toastr.success('تم إضافة التعليق', 'تم');
        }
      },
      error: (error) => {
        this.isSubmittingComment = false;
        this.toastr.error('حدث خطأ أثناء إضافة التعليق', 'خطأ');
      }
    });
  }

  onDeleteComment(commentId: string) {
    this.adsService.deleteComment(commentId).subscribe({
      next: () => {
        this.comments = this.comments.filter(c => c.id !== commentId);
        if (this.ad) {
          this.ad.commentsCount--;
        }
        this.toastr.success('تم حذف التعليق', 'تم');
      },
      error: (error) => {
        this.toastr.error('حدث خطأ أثناء حذف التعليق', 'خطأ');
      }
    });
  }

  onImageClick(index: number) {
    this.currentImageIndex = index;
  }

  nextImage() {
    if (this.ad && this.ad.images.length > 0) {
      this.currentImageIndex = (this.currentImageIndex + 1) % this.ad.images.length;
    }
  }

  previousImage() {
    if (this.ad && this.ad.images.length > 0) {
      this.currentImageIndex = this.currentImageIndex === 0 
        ? this.ad.images.length - 1 
        : this.currentImageIndex - 1;
    }
  }

  onContactSeller() {
    // Implement contact seller functionality
    this.toastr.info('جاري فتح نافذة المحادثة...', 'قريباً');
  }

  onEditAd() {
    if (this.ad) {
      this.router.navigate(['/ads/edit', this.ad.id]);
    }
  }

  onDeleteAd() {
    if (!this.ad) return;

    // Show confirmation dialog
    const confirmed = confirm('هل أنت متأكد من حذف هذا الإعلان؟');
    if (confirmed) {
      this.adsService.delete(this.ad.id).subscribe({
        next: () => {
          this.toastr.success('تم حذف الإعلان', 'تم');
          this.router.navigate(['/ads']);
        },
        error: (error) => {
          this.toastr.error('حدث خطأ أثناء حذف الإعلان', 'خطأ');
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Published': return 'success';
      case 'Pending': return 'warning';
      case 'Draft': return 'info';
      case 'Rejected': return 'error';
      case 'Archived': return 'default';
      default: return 'default';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Published': return 'منشور';
      case 'Pending': return 'في الانتظار';
      case 'Draft': return 'مسودة';
      case 'Rejected': return 'مرفوض';
      case 'Archived': return 'مؤرشف';
      default: return status;
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
