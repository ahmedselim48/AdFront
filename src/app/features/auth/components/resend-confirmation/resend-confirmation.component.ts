import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { LucideAngularModule, Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';

import { AuthService } from '../../../../core/auth/auth.service';
import { ResendConfirmationRequest } from '../../../../models/auth.models';

@Component({
  selector: 'app-resend-confirmation',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatIconModule,
    LucideAngularModule
  ],
  templateUrl: './resend-confirmation.component.html',
  styleUrls: ['./resend-confirmation.component.scss']
})
export class ResendConfirmationComponent implements OnInit {
  resendForm: FormGroup;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.resendForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  ngOnInit() {
    // Get email from query parameters if available
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.resendForm.patchValue({ email: params['email'] });
      }
    });

    // Check if user is already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onSubmit() {
    if (this.resendForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const resendRequest: ResendConfirmationRequest = {
        email: this.resendForm.value.email
      };

      this.authService.resendConfirmation(resendRequest).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.isSuccess = true;
          this.toastr.success('تم إرسال رابط التأكيد بنجاح', 'تم الإرسال');
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'حدث خطأ أثناء إرسال رابط التأكيد';
          this.toastr.error(this.errorMessage, 'خطأ');
        }
      });
    }
  }

  goBackToLogin() {
    this.router.navigate(['/auth/login']);
  }

  resendAgain() {
    this.isSuccess = false;
    this.errorMessage = '';
  }
}