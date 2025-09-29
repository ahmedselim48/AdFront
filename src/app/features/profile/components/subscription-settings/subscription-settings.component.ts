import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LucideAngularModule, CreditCard, Crown, Calendar, CheckCircle, XCircle } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../core/auth/auth.service';
import { SubscriptionStatus } from '../../../../models/auth.models';

@Component({
  selector: 'app-subscription-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    LucideAngularModule
  ],
  templateUrl: './subscription-settings.component.html',
  styleUrls: ['./subscription-settings.component.scss']
})
export class SubscriptionSettingsComponent implements OnInit {
  subscriptionStatus: SubscriptionStatus | null = null;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.loadSubscriptionStatus();
  }

  loadSubscriptionStatus() {
    this.isLoading = true;
    this.authService.getSubscriptionStatus().subscribe({
      next: (subscriptionStatus: SubscriptionStatus) => {
        this.subscriptionStatus = subscriptionStatus;
        this.isLoading = false;
      },
      error: (error: any) => {
        this.isLoading = false;
        console.error('Error loading subscription status:', error);
      }
    });
  }

  onUpgrade() {
    this.toastr.info('جاري التوجيه لصفحة الترقية...', 'قريباً');
  }

  onCancel() {
    this.toastr.info('جاري التوجيه لصفحة الإلغاء...', 'قريباً');
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
