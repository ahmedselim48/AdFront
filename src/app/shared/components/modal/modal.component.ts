import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      class="modal fade" 
      [class.show]="isVisible" 
      [class.d-block]="isVisible"
      [attr.aria-hidden]="!isVisible"
      tabindex="-1"
      role="dialog"
      [attr.aria-labelledby]="modalId + '-title'"
      #modalElement>
      <div class="modal-dialog" [ngClass]="modalSizeClass" role="document">
        <div class="modal-content">
          <!-- Modal Header -->
          <div class="modal-header" *ngIf="showHeader">
            <h5 class="modal-title" [id]="modalId + '-title'">
              <lucide-icon 
                *ngIf="icon" 
                [name]="icon" 
                size="20" 
                [class]="'me-2 text-' + iconColor">
              </lucide-icon>
              {{ title }}
            </h5>
            <button 
              type="button" 
              class="btn-close" 
              (click)="onClose()"
              aria-label="إغلاق">
              <lucide-icon name="x" size="16"></lucide-icon>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <ng-content></ng-content>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer" *ngIf="showFooter">
            <button 
              type="button" 
              class="btn btn-secondary" 
              (click)="onClose()"
              [disabled]="loading">
              {{ cancelText }}
            </button>
            <button 
              type="button" 
              class="btn"
              [class]="'btn-' + confirmButtonType"
              (click)="onConfirm()"
              [disabled]="loading || !canConfirm">
              <span *ngIf="!loading">{{ confirmText }}</span>
              <span *ngIf="loading" class="spinner-border spinner-border-sm me-2" role="status">
                <span class="visually-hidden">جاري التحميل...</span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div 
      class="modal-backdrop fade" 
      [class.show]="isVisible"
      *ngIf="isVisible">
    </div>
  `,
  styles: [`
    .modal {
      z-index: 1055;
    }

    .modal.show {
      display: block !important;
    }

    .modal-backdrop {
      z-index: 1050;
    }

    .modal-backdrop.show {
      opacity: 0.5;
    }

    .modal-dialog {
      margin: 1.75rem auto;
      max-width: 500px;
    }

    .modal-dialog-sm {
      max-width: 300px;
    }

    .modal-dialog-lg {
      max-width: 800px;
    }

    .modal-dialog-xl {
      max-width: 1140px;
    }

    .modal-dialog-fullscreen {
      max-width: 100vw;
      height: 100vh;
      margin: 0;
    }

    .modal-content {
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 1.5rem;
    }

    .modal-title {
      margin: 0;
      font-weight: 600;
      color: #212529;
    }

    .btn-close {
      background: none;
      border: none;
      padding: 0.5rem;
      margin: -0.5rem -0.5rem -0.5rem auto;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: background-color 0.15s ease-in-out;
    }

    .btn-close:hover {
      background-color: #f8f9fa;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      border-top: 1px solid #dee2e6;
      padding: 1rem 1.5rem;
      display: flex;
      justify-content: flex-end;
      gap: 0.5rem;
    }

    .spinner-border-sm {
      width: 1rem;
      height: 1rem;
    }

    @media (max-width: 576px) {
      .modal-dialog {
        margin: 0.5rem;
        max-width: calc(100% - 1rem);
      }

      .modal-dialog-fullscreen {
        margin: 0;
        max-width: 100%;
      }

      .modal-header,
      .modal-body,
      .modal-footer {
        padding: 1rem;
      }
    }
  `]
})
export class ModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() title = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' = 'md';
  @Input() showHeader = true;
  @Input() showFooter = true;
  @Input() confirmText = 'تأكيد';
  @Input() cancelText = 'إلغاء';
  @Input() confirmButtonType: 'primary' | 'success' | 'danger' | 'warning' = 'primary';
  @Input() canConfirm = true;
  @Input() loading = false;
  @Input() icon: string | null = null;
  @Input() iconColor: 'primary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  @Input() closeOnBackdrop = true;
  @Input() closeOnEscape = true;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  @ViewChild('modalElement') modalElement!: ElementRef;

  isVisible = false;
  modalId = 'modal-' + Math.random().toString(36).substr(2, 9);

  get modalSizeClass(): string {
    const sizeMap = {
      'sm': 'modal-dialog-sm',
      'md': '',
      'lg': 'modal-dialog-lg',
      'xl': 'modal-dialog-xl',
      'fullscreen': 'modal-dialog-fullscreen'
    };
    return sizeMap[this.size] || '';
  }

  ngOnInit() {
    // Generate unique modal ID
    this.modalId = 'modal-' + Math.random().toString(36).substr(2, 9);
  }

  ngAfterViewInit() {
    if (this.isVisible) {
      this.focusModal();
    }
  }

  ngOnDestroy() {
    this.hideBackdrop();
  }

  show() {
    this.isVisible = true;
    this.showBackdrop();
    this.focusModal();
    this.preventBodyScroll();
  }

  hide() {
    this.isVisible = false;
    this.hideBackdrop();
    this.restoreBodyScroll();
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
    this.hide();
  }

  onClose() {
    this.hide();
  }

  private focusModal() {
    setTimeout(() => {
      if (this.modalElement) {
        const focusableElement = this.modalElement.nativeElement.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElement) {
          focusableElement.focus();
        }
      }
    }, 100);
  }

  private showBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.add('show');
    }
  }

  private hideBackdrop() {
    const backdrop = document.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('show');
    }
  }

  private preventBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private restoreBodyScroll() {
    document.body.style.overflow = '';
  }

  // Handle backdrop click
  onBackdropClick(event: Event) {
    if (this.closeOnBackdrop && event.target === event.currentTarget) {
      this.close();
    }
  }

  // Handle escape key
  onKeyDown(event: KeyboardEvent) {
    if (this.closeOnEscape && event.key === 'Escape') {
      this.close();
    }
  }
}
