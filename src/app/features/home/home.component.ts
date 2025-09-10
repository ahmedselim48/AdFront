import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { AdsService } from '../ads/ads.service';
import { AdItem } from '../../models/ads.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {
  ads: AdItem[] = [];
  loading = true;
  error = '';
  skeletons = Array.from({ length: 6 });
  
  constructor(
    private adsService: AdsService,
    private route: ActivatedRoute,
    private router: Router
  ){
    // Check for URL parameters and redirect if needed
    this.checkUrlParameters();
    this.adsService.list().subscribe({
      next: (list)=> { 
        this.ads = list; 
        this.loading = false; 
        console.log('Ads loaded:', list);
        
        // Fallback data if no ads
        if (list.length === 0) {
          this.ads = [
            {
              id: '1',
              name: 'iPhone 14 Pro Max',
              category: 'Riyadh',
              price: 4200,
              status: 'active',
              scheduleAt: new Date().toISOString(),
              variants: [{
                id: '1',
                title: 'iPhone 14 Pro Max',
                body: 'Mint condition, 256GB, Space Black',
                imageUrl: '',
                isActive: true
              }]
            },
            {
              id: '2',
              name: 'Toyota Camry 2018',
              category: 'Jeddah',
              price: 52000,
              status: 'active',
              scheduleAt: new Date().toISOString(),
              variants: [{
                id: '2',
                title: 'Toyota Camry 2018',
                body: 'Excellent condition, full option',
                imageUrl: '',
                isActive: true
              }]
            }
          ];
        }
      },
      error: (err)=> { 
        this.ads = []; 
        this.loading = false; 
        this.error = 'فشل في تحميل الإعلانات';
        console.error('Error loading ads:', err);
      }
    });
  }

  private checkUrlParameters(): void {
    const userId = this.route.snapshot.queryParamMap.get('userId');
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');
    
    // Check if this is a password reset link (usually has userId and token, no email)
    if (userId && token && !email) {
      console.log('Detected userId and token parameters for password reset, redirecting to reset-password');
      this.router.navigate(['/auth/reset'], { 
        queryParams: { token: token, userId: userId },
        replaceUrl: true 
      });
      return;
    }
    
    // Check if this is an email verification link with userId and token
    if (userId && token && email) {
      console.log('Detected userId, token and email parameters, redirecting to verify-email');
      this.router.navigate(['/auth/verify-email'], { 
        queryParams: { token: token, userId: userId, email: email },
        replaceUrl: true 
      });
      return;
    }
    
    // Check for email verification with just token and email
    if (token && email && !userId) {
      console.log('Detected token and email parameters, redirecting to verify-email');
      this.router.navigate(['/auth/verify-email'], { 
        queryParams: { token: token, email: email },
        replaceUrl: true 
      });
      return;
    }
  }
}
