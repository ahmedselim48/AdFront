import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    LucideAngularModule
  ],
  template: `
    <div class="payment-cancel-container">
      <mat-card class="cancel-card">
        <div class="cancel-content">
          <div class="cancel-icon">
            <lucide-icon name="x-circle" size="64" color="#ef4444"></lucide-icon>
          </div>
          
          <h1>تم إلغاء الدفع</h1>
          <p>لم يتم إكمال عملية الدفع. يمكنك المحاولة مرة أخرى في أي وقت.</p>
          
          <div class="actions">
            <button mat-raised-button color="primary" (click)="retryPayment()">
              <lucide-icon name="credit-card" size="16"></lucide-icon>
              <span>المحاولة مرة أخرى</span>
            </button>
            <button mat-button (click)="goToProfile()">
              <lucide-icon name="user" size="16"></lucide-icon>
              <span>الملف الشخصي</span>
            </button>
            <button mat-button (click)="goToHome()">
              <lucide-icon name="home" size="16"></lucide-icon>
              <span>الصفحة الرئيسية</span>
            </button>
          </div>
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .payment-cancel-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
      background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
    }

    .cancel-card {
      max-width: 500px;
      width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .cancel-content {
      padding: 3rem 2rem;
      text-align: center;
    }

    .cancel-icon {
      margin-bottom: 1.5rem;
    }

    h1 {
      font-size: 2rem;
      font-weight: 700;
      color: #dc2626;
      margin: 0 0 1rem 0;
    }

    p {
      font-size: 1rem;
      color: #6b7280;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-transform: none;
      font-weight: 500;
    }

    @media (max-width: 600px) {
      .payment-cancel-container {
        padding: 1rem;
      }

      .cancel-content {
        padding: 2rem 1.5rem;
      }

      .actions {
        flex-direction: column;
      }

      button {
        width: 100%;
      }
    }
  `]
})
export class PaymentCancelComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // Log cancellation if needed
    this.route.queryParams.subscribe(params => {
      const sessionId = params['sessionId'];
      if (sessionId) {
        console.log('Payment cancelled for session:', sessionId);
      }
    });
  }

  retryPayment() {
    this.router.navigate(['/profile/subscription']);
  }

  goToProfile() {
    this.router.navigate(['/profile']);
  }

  goToHome() {
    this.router.navigate(['/']);
  }
}


