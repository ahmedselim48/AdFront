import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, AlertCircle, XCircle, Info, AlertTriangle } from 'lucide-angular';

@Component({
  selector: 'app-error-message',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="error-message" [class]="'error-' + type" *ngIf="message">
      <div class="error-content">
        <lucide-icon [name]="iconName" size="20" class="error-icon"></lucide-icon>
        <div class="error-text">
          <div class="error-title" *ngIf="title">{{ title }}</div>
          <div class="error-message-text">{{ message }}</div>
          <ul class="error-list" *ngIf="errors && errors.length > 0">
            <li *ngFor="let error of errors">{{ error }}</li>
          </ul>
        </div>
        <button 
          class="btn-close" 
          *ngIf="dismissible" 
          (click)="onDismiss()"
          aria-label="إغلاق">
        </button>
      </div>
    </div>
  `,
  styles: [`
    .error-message {
      border-radius: 0.375rem;
      padding: 1rem;
      margin-bottom: 1rem;
      border: 1px solid transparent;
    }

    .error-content {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
    }

    .error-icon {
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .error-text {
      flex: 1;
    }

    .error-title {
      font-weight: 600;
      margin-bottom: 0.25rem;
    }

    .error-message-text {
      margin-bottom: 0.5rem;
    }

    .error-list {
      margin: 0;
      padding-right: 1rem;
      list-style-type: disc;
    }

    .error-list li {
      margin-bottom: 0.25rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.25rem;
      font-weight: 700;
      line-height: 1;
      color: #000;
      opacity: 0.5;
      cursor: pointer;
      padding: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      opacity: 0.75;
    }

    .error-error {
      background-color: #f8d7da;
      border-color: #f5c6cb;
      color: #721c24;
    }

    .error-error .error-icon {
      color: #dc3545;
    }

    .error-warning {
      background-color: #fff3cd;
      border-color: #ffeaa7;
      color: #856404;
    }

    .error-warning .error-icon {
      color: #ffc107;
    }

    .error-info {
      background-color: #d1ecf1;
      border-color: #bee5eb;
      color: #0c5460;
    }

    .error-info .error-icon {
      color: #17a2b8;
    }

    .error-success {
      background-color: #d4edda;
      border-color: #c3e6cb;
      color: #155724;
    }

    .error-success .error-icon {
      color: #28a745;
    }
  `]
})
export class ErrorMessageComponent {
  @Input() type: 'error' | 'warning' | 'info' | 'success' = 'error';
  @Input() title = '';
  @Input() message = '';
  @Input() errors: string[] = [];
  @Input() dismissible = false;

  get iconName(): string {
    switch (this.type) {
      case 'error':
        return 'x-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
        return 'info';
      case 'success':
        return 'check-circle';
      default:
        return 'alert-circle';
    }
  }

  onDismiss() {
    // Emit event or handle dismissal
    this.message = '';
    this.errors = [];
  }
}
