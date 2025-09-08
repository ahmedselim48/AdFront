import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent {
  form = this.fb.group({
    name: ['', Validators.required],
    status: ['draft', Validators.required],
    scheduleAt: [''],
    variants: this.fb.array([this.createVariant(true)])
  });

  get variants(){ return this.form.get('variants') as FormArray; }

  constructor(private fb: FormBuilder, private fileSvc: FileService){}

  createVariant(active=false){ return this.fb.group({ title: ['', Validators.required], body: ['', Validators.required], isActive: [active] }); }
  addVariant(){ this.variants.push(this.createVariant(false)); }
  removeVariant(i: number){ this.variants.removeAt(i); }

  async onFile(event: Event, i: number){
    const input = event.target as HTMLInputElement;
    if(!input.files?.length) return;
    const file = input.files[0];
    const compressed = await this.fileSvc.compressImage(file, 0.8, 1200);
    // Ready to upload 'compressed' via backend service
  }

  save(){ /* integrate with backend to persist */ }
}
