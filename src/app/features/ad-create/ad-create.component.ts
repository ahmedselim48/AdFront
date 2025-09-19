import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AdsService } from '../../core/services/ads.service';

@Component({
  selector: 'app-ad-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './ad-create.component.html',
  styleUrls: ['./ad-create.component.scss']
})
export class AdCreateComponent {
  form: FormGroup;
  selectedFiles: File[] = [];
  previewUrls: string[] = [];
  uploading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private adsService: AdsService,
    private router: Router
  ) {
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(200)]],
      description: ['', [Validators.required, Validators.maxLength(5000)]],
      price: [0, [Validators.min(0)]],
      location: ['', [Validators.required, Validators.maxLength(200)]],
      userId: ['', Validators.required]
    });
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

  submit() {
    if (this.form.invalid) return;

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
          this.error = res.message;
        }
      },
      error: err => {
        this.uploading = false;
        this.error = err?.message ?? 'Upload failed';
      }
    });
  }
}
