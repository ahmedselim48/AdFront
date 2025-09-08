import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="ads-wrap">
    <h2>Create Ad</h2>
    <form [formGroup]="form" (ngSubmit)="save()" class="grid">
      <label>Name<input formControlName="name"></label>
      <label>Status<select formControlName="status"><option value="draft">Draft</option><option value="scheduled">Scheduled</option><option value="active">Active</option><option value="paused">Paused</option></select></label>
      <label>Schedule at<input type="datetime-local" formControlName="scheduleAt"></label>
      <div class="variants">
        <div class="variants-header">
          <h3>Variants (A/B)</h3>
          <button type="button" (click)="addVariant()">Add Variant</button>
        </div>
        <div class="variant" *ngFor="let v of variants.controls; let i = index" [formGroup]="v">
          <label>Title<input formControlName="title"></label>
          <label>Body<textarea formControlName="body"></textarea></label>
          <label>Active<input type="checkbox" formControlName="isActive"></label>
          <input type="file" (change)="onFile($event, i)">
          <button type="button" (click)="removeVariant(i)">Remove</button>
        </div>
      </div>
      <button type="submit" [disabled]="form.invalid">Save</button>
    </form>
  </section>
  `,
  styles: [`.grid{display:grid;gap:1rem}
  label{display:flex;flex-direction:column;gap:.25rem}
  input,select,textarea{padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  .variants{border:1px solid #e5e7eb;border-radius:.5rem;padding:.75rem}
  .variants-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem}
  .variant{display:grid;gap:.5rem;border:1px dashed #e5e7eb;border-radius:.5rem;padding:.5rem;margin-bottom:.5rem}
  button{width:max-content;padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}`]
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
