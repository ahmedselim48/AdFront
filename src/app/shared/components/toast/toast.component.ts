import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div 
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1080;">
      <div 
        class="toast show" 
        role="alert" 
        aria-live="assertive" 
        aria-atomic="true"
        [class]="toastClass">
        <div class="toast-header">
          <div class="toast-icon me-2">
            <lucide-icon [name]="iconName" size="20" [class]="'text-' + type"></lucide-icon>
          </div>
          <strong class="me-auto">{{ title }}</strong>
          <small class="text-muted">{{ timeAgo }}</small>
          <button 
            type="button" 
            class="btn-close" 
            (click)="onDismiss()"
            aria-label="إغلاق">
            <lucide-icon name="x" size="14"></lucide-icon>
          </button>
        </div>
        <div class="toast-body" *ngIf="message">
          {{ message }}
        </div>
        <div class="toast-actions" *ngIf="showActions">
          <button 
            class="btn btn-sm btn-outline-primary me-2"
            (click)="onActionClick()"
            *ngIf="actionText">
            {{ actionText }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      max-width: 350px;
    }

    .toast {
      border: none;
      border-radius: 0.5rem;
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
      margin-bottom: 0.5rem;
    }

    .toast-header {
      background-color: transparent;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      padding: 0.75rem 1rem;
    }

    .toast-icon {
      display: flex;
      align-items: center;
    }

    .toast-body {
      padding: 0.75rem 1rem;
      color: #495057;
    }

    .toast-actions {
      padding: 0.5rem 1rem 0.75rem;
      border-top: 1px solid rgba(0, 0, 0, 0.1);
    }

    .btn-close {
      background: none;
      border: none;
      padding: 0.25rem;
      margin: -0.25rem -0.25rem -0.25rem auto;
      cursor: pointer;
      border-radius: 0.25rem;
      transition: background-color 0.15s ease-in-out;
    }

    .btn-close:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    .toast-success {
      background-color: #d1e7dd;
      border-left: 4px solid #198754;
    }

    .toast-error {
      background-color: #f8d7da;
      border-left: 4px solid #dc3545;
    }

    .toast-warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
    }

    .toast-info {
      background-color: #d1ecf1;
      border-left: 4px solid #0dcaf0;
    }

    .toast-primary {
      background-color: #cfe2ff;
      border-left: 4px solid #0d6efd;
    }

    .text-success {
      color: #198754 !important;
    }

    .text-danger {
      color: #dc3545 !important;
    }

    .text-warning {
      color: #ffc107 !important;
    }

    .text-info {
      color: #0dcaf0 !important;
    }

    .text-primary {
      color: #0d6efd !important;
    }

    @media (max-width: 576px) {
      .toast-container {
        max-width: calc(100% - 1rem);
        right: 0.5rem;
        top: 0.5rem;
      }
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() type: 'success' | 'error' | 'warning' | 'info' | 'primary' = 'info';
  @Input() title = '';
  @Input() message = '';
  @Input() actionText = '';
  @Input() showActions = false;
  @Input() duration = 5000; // 5 seconds default
  @Input() autoClose = true;

  @Output() action = new EventEmitter<void>();
  @Output() dismiss = new EventEmitter<void>();

  timeAgo = '';
  private timer: any;

  get toastClass(): string {
    return `toast-${this.type}`;
  }

  get iconName(): string {
    const iconMap = {
      'success': 'check-circle',
      'error': 'x-circle',
      'warning': 'alert-circle',
      'info': 'info',
      'primary': 'info'
    };
    return iconMap[this.type] || 'info';
  }

  ngOnInit() {
    this.updateTimeAgo();
    this.startTimer();
  }

  ngOnDestroy() {
    this.clearTimer();
  }

  onActionClick() {
    this.action.emit();
  }

  onDismiss() {
    this.clearTimer();
    this.dismiss.emit();
  }

  private startTimer() {
    if (this.autoClose && this.duration > 0) {
      this.timer = setTimeout(() => {
        this.dismiss.emit();
      }, this.duration);
    }
  }

  private clearTimer() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }

  private updateTimeAgo() {
    const now = new Date();
    this.timeAgo = 'الآن';
    
    // Update time ago every minute
    setInterval(() => {
      this.timeAgo = 'الآن';
    }, 60000);
  }
}