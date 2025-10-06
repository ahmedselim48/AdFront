import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-subscription-required-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <div class="subscription-dialog">
      <div class="dialog-header">
        <div class="icon-container">
          <lucide-icon name="crown" size="48" color="#f59e0b"></lucide-icon>
        </div>
        <h2>اشتراك مطلوب</h2>
        <p>يجب عليك الاشتراك لإنشاء إعلانات جديدة</p>
      </div>

      <div class="dialog-content">
        <div class="features-list">
          <div class="feature-item">
            <lucide-icon name="check-circle" size="20" color="#10b981"></lucide-icon>
            <span>إعلانات غير محدودة</span>
          </div>
          <div class="feature-item">
            <lucide-icon name="check-circle" size="20" color="#10b981"></lucide-icon>
            <span>تحليل المنافسة</span>
          </div>
          <div class="feature-item">
            <lucide-icon name="check-circle" size="20" color="#10b981"></lucide-icon>
            <span>تقارير مفصلة</span>
          </div>
          <div class="feature-item">
            <lucide-icon name="check-circle" size="20" color="#10b981"></lucide-icon>
            <span>دعم أولوية</span>
          </div>
        </div>

        <div class="pricing-info">
          <div class="price">
            <span class="amount">200 ر.س</span>
            <span class="period">شهرياً</span>
          </div>
          <p class="description">اشتراك شهري يتيح لك إنشاء إعلانات غير محدودة</p>
        </div>
      </div>

      <div class="dialog-actions">
        <button mat-button (click)="onCancel()" class="cancel-btn">
          <lucide-icon name="x" size="16"></lucide-icon>
          <span>إلغاء</span>
        </button>
        <button mat-raised-button color="primary" (click)="onSubscribe()" class="subscribe-btn">
          <lucide-icon name="credit-card" size="16"></lucide-icon>
          <span>اشتراك الآن</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .subscription-dialog {
      padding: 0;
      max-width: 500px;
    }

    .dialog-header {
      text-align: center;
      padding: 2rem 2rem 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      border-radius: 12px 12px 0 0;
    }

    .icon-container {
      margin-bottom: 1rem;
    }

    .dialog-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #1f2937;
    }

    .dialog-header p {
      margin: 0;
      color: #6b7280;
      font-size: 1rem;
    }

    .dialog-content {
      padding: 2rem;
    }

    .features-list {
      margin-bottom: 2rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      padding: 0.5rem;
      background: #f8fafc;
      border-radius: 8px;
    }

    .feature-item span {
      font-size: 0.95rem;
      color: #374151;
      font-weight: 500;
    }

    .pricing-info {
      text-align: center;
      padding: 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      color: white;
    }

    .price {
      margin-bottom: 0.5rem;
    }

    .amount {
      font-size: 2rem;
      font-weight: 700;
      display: block;
    }

    .period {
      font-size: 1rem;
      opacity: 0.9;
    }

    .description {
      margin: 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .dialog-actions {
      display: flex;
      gap: 1rem;
      padding: 1.5rem 2rem;
      background: #f8fafc;
      border-radius: 0 0 12px 12px;
    }

    .cancel-btn {
      flex: 1;
      color: #6b7280;
    }

    .subscribe-btn {
      flex: 2;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      font-weight: 600;
    }

    .subscribe-btn:hover {
      background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
    }

    button {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      text-transform: none;
      font-size: 0.95rem;
    }
  `]
})
export class SubscriptionRequiredDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SubscriptionRequiredDialogComponent>
  ) {}

  onCancel() {
    this.dialogRef.close('cancel');
  }

  onSubscribe() {
    this.dialogRef.close('subscribe');
  }
}




