import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';   
import { AdsService } from '../../core/services/ads.service';
import { I18nService } from '../../core/services/i18n.service';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe
  ],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent implements OnInit {
  form: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;
  error = '';
  private t = inject(I18nService);

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
    private adsService: AdsService,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      price: [null, [Validators.required, Validators.min(0)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      category: ['', Validators.required],   // ✅ مضافة
      userId: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Check if user is admin and redirect
    if (this.isAdmin) {
      this.router.navigate(['/ads']);
      return;
    }
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
      this.previewUrls = [];

      this.selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => this.previewUrls.push(reader.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  // submit() {
  //   if (this.form.invalid) return;

  //   this.uploading = true;
  //   const payload = {
  //     ...this.form.value,
  //     images: this.selectedFiles
  //   };

  //   this.adsService.createWithFiles(payload).subscribe({
  //     next: res => {
  //       this.uploading = false;
  //       if (res.success) {
  //         this.router.navigate(['/ads']);
  //       } else {
  //         this.error = res.message;
  //       }
  //     },
  //     error: err => {
  //       this.uploading = false;
  //       this.error = err?.message ?? 'Upload failed';
  //     }
  //   });
  // }
submit() {
  if (this.form.invalid) {
    this.error = this.t.t('ads.formInvalid'); 
    return;
  }

  this.uploading = true;
  const payload = {
    ...this.form.value,
    images: this.selectedFiles
  };

  this.adsService.createWithFiles(payload).subscribe({
    next: res => {
      this.uploading = false;
      if (res.success) {
        this.router.navigate(['/ads']);
      } else {
        this.error = this.t.t('ads.uploadFailed'); 
      }
    },
    error: err => {
      this.uploading = false;
      this.error = this.t.t('ads.uploadFailed');
    }
  });
}
// ad-form.component.ts
onAnalyze() {
  this.adsService.analyzeImages(this.selectedFiles[0].name).subscribe(result => {
    if (result.data?.isSuccessful) {
      this.form.patchValue({
        title: result.data.title,
        description: result.data.description,
        category: result.data.category
      });
    } else {
      alert("فشل التحليل: " + result.data?.errorMessage);
    }
  });
}

//   onAnalyzeAd() {
//     if (!this.selectedFiles.length) return;

//     this.adsService.analyzeAd(this.selectedFiles).subscribe(res => {
//       this.form.patchValue({
//         title: res.suggestedTitle,
//         description: res.suggestedDescription,
//         category: res.suggestedCategory  
//       });
//     });
//   }
//   fillWithAI() {
//   // قيم جاهزة للتجربة
//   this.form.patchValue({
//     title: 'Amazing Product Title',
//     description: 'This product is amazing because it solves your problem efficiently and beautifully.'
//   });
// }


}
