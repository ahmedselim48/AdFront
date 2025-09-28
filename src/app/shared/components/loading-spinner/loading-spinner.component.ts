import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Loader } from 'lucide-angular';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="loading-spinner" [class.overlay]="overlay" [class.small]="size === 'small'" [class.large]="size === 'large'">
      <div class="spinner-container">
        <lucide-icon name="refresh-cw" size="24" [class.spinning]="true"></lucide-icon>
        <div class="spinner-text" *ngIf="text">{{ text }}</div>
      </div>
    </div>
  `,
  styles: [`
    .loading-spinner {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .loading-spinner.overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      padding: 0;
    }

    .loading-spinner.small {
      padding: 1rem;
    }

    .loading-spinner.small lucide-icon {
      width: 16px;
      height: 16px;
    }

    .loading-spinner.large {
      padding: 3rem;
    }

    .loading-spinner.large lucide-icon {
      width: 48px;
      height: 48px;
    }

    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    .spinner-text {
      font-size: 0.875rem;
      color: #6c757d;
      text-align: center;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() overlay = false;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  @Input() text = '';
}
