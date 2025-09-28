import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Heart, Eye, MessageSquare, Star, MapPin, Calendar, User, MoreVertical } from 'lucide-angular';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="card h-100" [class.card-hover]="hoverable">
      <!-- Card Image -->
      <div class="card-image" *ngIf="imageUrl">
        <img 
          [src]="imageUrl" 
          [alt]="title"
          class="card-img-top"
          [class.card-img-top-loading]="imageLoading"
          (load)="onImageLoad()"
          (error)="onImageError()">
        <div class="card-image-overlay" *ngIf="showOverlay">
          <div class="card-actions">
            <button 
              class="btn btn-sm btn-light me-2"
              (click)="onViewClick()"
              [title]="'عرض التفاصيل'">
              <lucide-icon name="eye" size="16"></lucide-icon>
            </button>
            <button 
              class="btn btn-sm btn-light"
              (click)="onMoreClick()"
              [title]="'المزيد'">
              <lucide-icon name="more-vertical" size="16"></lucide-icon>
            </button>
          </div>
        </div>
        <div class="card-badges" *ngIf="badges && badges.length > 0">
          <span 
            *ngFor="let badge of badges" 
            class="badge"
            [class]="'badge-' + (badge.type || 'secondary')">
            {{ badge.text }}
          </span>
        </div>
      </div>

      <!-- Card Body -->
      <div class="card-body d-flex flex-column">
        <!-- Card Header -->
        <div class="card-header-custom mb-2" *ngIf="showHeader">
          <div class="d-flex justify-content-between align-items-start">
            <h6 class="card-title mb-0">{{ title }}</h6>
            <div class="card-price" *ngIf="price">
              <span class="price-amount">{{ price | currency:'SAR':'symbol':'1.0-0':'ar' }}</span>
            </div>
          </div>
        </div>

        <!-- Card Content -->
        <div class="card-content flex-grow-1">
          <p class="card-text" *ngIf="description">
            {{ description | slice:0:maxDescriptionLength }}{{ description.length > maxDescriptionLength ? '...' : '' }}
          </p>

          <!-- Card Meta -->
          <div class="card-meta" *ngIf="showMeta">
            <div class="row g-2">
              <div class="col-6" *ngIf="location">
                <small class="text-muted d-flex align-items-center">
                  <lucide-icon name="map-pin" size="14" class="me-1"></lucide-icon>
                  {{ location }}
                </small>
              </div>
              <div class="col-6" *ngIf="date">
                <small class="text-muted d-flex align-items-center">
                  <lucide-icon name="calendar" size="14" class="me-1"></lucide-icon>
                  {{ date | date:'short' }}
                </small>
              </div>
              <div class="col-6" *ngIf="author">
                <small class="text-muted d-flex align-items-center">
                  <lucide-icon name="user" size="14" class="me-1"></lucide-icon>
                  {{ author }}
                </small>
              </div>
              <div class="col-6" *ngIf="category">
                <small class="text-muted">
                  {{ category }}
                </small>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="card-footer-custom mt-auto" *ngIf="showFooter">
          <div class="d-flex justify-content-between align-items-center">
            <!-- Stats -->
            <div class="card-stats" *ngIf="showStats">
              <span class="stat-item me-3" *ngIf="viewsCount !== undefined">
                <lucide-icon name="eye" size="14" class="me-1"></lucide-icon>
                {{ viewsCount | number }}
              </span>
              <span class="stat-item me-3" *ngIf="likesCount !== undefined">
                <lucide-icon name="heart" size="14" class="me-1"></lucide-icon>
                {{ likesCount | number }}
              </span>
              <span class="stat-item" *ngIf="commentsCount !== undefined">
                <lucide-icon name="message-square" size="14" class="me-1"></lucide-icon>
                {{ commentsCount | number }}
              </span>
            </div>

            <!-- Actions -->
            <div class="card-actions" *ngIf="showActions">
              <button 
                class="btn btn-sm btn-outline-primary me-2"
                (click)="onViewClick()">
                عرض
              </button>
              <button 
                class="btn btn-sm btn-outline-secondary"
                (click)="onMoreClick()">
                <lucide-icon name="more-vertical" size="16"></lucide-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div class="card-loading-overlay" *ngIf="loading">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">جاري التحميل...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #dee2e6;
      border-radius: 0.5rem;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    }

    .card-hover:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .card-image {
      position: relative;
      height: 200px;
      overflow: hidden;
    }

    .card-img-top {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .card-img-top-loading {
      opacity: 0.7;
    }

    .card-image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .card:hover .card-image-overlay {
      opacity: 1;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
    }

    .card-badges {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .badge {
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }

    .card-header-custom {
      border-bottom: 1px solid #f8f9fa;
      padding-bottom: 0.75rem;
    }

    .card-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #212529;
      line-height: 1.3;
    }

    .card-price {
      text-align: left;
    }

    .price-amount {
      font-size: 1.2rem;
      font-weight: 700;
      color: #198754;
    }

    .card-text {
      color: #6c757d;
      font-size: 0.9rem;
      line-height: 1.4;
      margin-bottom: 0.75rem;
    }

    .card-meta {
      margin-bottom: 0.75rem;
    }

    .card-meta small {
      font-size: 0.8rem;
    }

    .card-footer-custom {
      border-top: 1px solid #f8f9fa;
      padding-top: 0.75rem;
    }

    .card-stats {
      display: flex;
      align-items: center;
    }

    .stat-item {
      font-size: 0.8rem;
      color: #6c757d;
      display: flex;
      align-items: center;
    }

    .card-loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }

    @media (max-width: 768px) {
      .card-image {
        height: 150px;
      }
      
      .card-title {
        font-size: 1rem;
      }
      
      .price-amount {
        font-size: 1.1rem;
      }
    }
  `]
})
export class CardComponent {
  @Input() title = '';
  @Input() description = '';
  @Input() imageUrl = '';
  @Input() price: number | null = null;
  @Input() location = '';
  @Input() date: Date | string | null = null;
  @Input() author = '';
  @Input() category = '';
  @Input() viewsCount: number | undefined = undefined;
  @Input() likesCount: number | undefined = undefined;
  @Input() commentsCount: number | undefined = undefined;
  @Input() badges: { text: string; type?: string }[] = [];
  @Input() hoverable = true;
  @Input() loading = false;
  @Input() showHeader = true;
  @Input() showMeta = true;
  @Input() showFooter = true;
  @Input() showStats = true;
  @Input() showActions = true;
  @Input() showOverlay = true;
  @Input() maxDescriptionLength = 100;

  @Output() viewClick = new EventEmitter<void>();
  @Output() moreClick = new EventEmitter<void>();
  @Output() likeClick = new EventEmitter<void>();
  @Output() commentClick = new EventEmitter<void>();

  imageLoading = true;

  onImageLoad() {
    this.imageLoading = false;
  }

  onImageError() {
    this.imageLoading = false;
    // You can set a default image here
  }

  onViewClick() {
    this.viewClick.emit();
  }

  onMoreClick() {
    this.moreClick.emit();
  }

  onLikeClick() {
    this.likeClick.emit();
  }

  onCommentClick() {
    this.commentClick.emit();
  }
}
