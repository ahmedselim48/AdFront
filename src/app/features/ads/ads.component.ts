import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FileService } from '../../core/services/file.service';
import { AdsService } from './ads.service';
import { OpenAiService } from '../../infrastructure/openai/openai.service';
import { AuthService } from '../../core/auth/auth.service';
import { SubscriptionService } from '../../core/services/subscription.service';
import { SubscriptionRequiredDialogComponent } from '../../shared/components/subscription-required-dialog/subscription-required-dialog.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ABTestDashboardComponent } from './components/ab-test-dashboard/ab-test-dashboard.component';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    TranslatePipe,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    ABTestDashboardComponent
  ],
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  saving = false;
  generating = false;
  private destroy$ = new Subject<void>();

  get variants(){ return this.form.get('variants') as FormArray<FormGroup>; }

  // User role check
  get isAdmin(): boolean {
    const user = this.authService.getCurrentUser();
    if (!user) {
      // Fallback: check localStorage for user data
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as any;
          return parsedUser.roles?.includes('Admin') || parsedUser.roles?.includes('admin') || false;
        } catch (e) {
          return false;
        }
      }
      return false;
    }
    return user.roles?.includes('Admin') || user.roles?.includes('admin') || false;
  }

  constructor(
    private fb: FormBuilder, 
    private fileSvc: FileService, 
    private ads: AdsService, 
    private ai: OpenAiService,
    private authService: AuthService,
    private subscriptionService: SubscriptionService,
    private router: Router,
    private dialog: MatDialog
  ){
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: [''],
      price: [null],
      status: ['draft', Validators.required],
      scheduleAt: [''],
      variants: this.fb.array([this.createVariant(true)])
    });
  }

  ngOnInit() {
    // Check if user is admin and redirect
    if (this.isAdmin) {
      this.router.navigate(['/ads/list']);
      return;
    }
  }

  createVariant(active=false){ return this.fb.group({ title: ['', Validators.required], body: ['', Validators.required], isActive: [active] }); }
  addVariant(){ this.variants.push(this.createVariant(false)); }
  removeVariant(i: number){ this.variants.removeAt(i); }

  async onFile(event: Event, i: number){
    const input = event.target as HTMLInputElement;
    if(!input.files?.length) return;
    const file = input.files[0];
    const compressed = await this.fileSvc.compressImage(file, 0.8, 1200);
  }

  async generateFromAI(){
    if(this.generating) return;
    this.generating = true;
    const first = this.variants.at(0);
    const body = first.get('body')?.value || '';
    this.ai.createSmartReply(body || 'Generate product ad title and description').then((r: any) => {
      const text = r.reply || '';
      first.patchValue({ title: text.split('\n')[0]?.slice(0, 80) || 'Generated Title', body: text });
      this.generating = false;
    }).catch(() => { 
      this.generating = false; 
    });
  }

  save(){
    if(this.form.invalid || this.saving) return;
    this.saving = true;
    
    // Check subscription before creating ad
    this.subscriptionService.hasActiveSubscription().pipe(takeUntil(this.destroy$)).subscribe({
      next: (hasActiveSubscription) => {
        if (hasActiveSubscription) {
          this.createAd();
        } else {
          this.showSubscriptionRequiredDialog();
        }
      },
      error: (error) => {
        console.error('Error checking subscription:', error);
        // If we can't check subscription, allow creation but show warning
        this.createAd();
      }
    });
  }

  private createAd() {
    this.ads.create(this.form.value).subscribe({
      next: () => { 
        this.saving = false; 
        this.form.reset({ name: '', category: '', price: null, status: 'draft', scheduleAt: '' }); 
        this.variants.clear(); 
        this.variants.push(this.createVariant(true)); 
      },
      error: () => { this.saving = false; }
    });
  }

  private showSubscriptionRequiredDialog() {
    const dialogRef = this.dialog.open(SubscriptionRequiredDialogComponent, {
      width: '500px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      this.saving = false;
      if (result === 'subscribe') {
        this.router.navigate(['/profile/subscription']);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
