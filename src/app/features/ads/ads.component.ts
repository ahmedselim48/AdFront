import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FileService } from '../../core/services/file.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent {
  form!: FormGroup;

  get variants(){ return this.form.get('variants') as FormArray<FormGroup>; }

  constructor(private fb: FormBuilder, private fileSvc: FileService){
    this.form = this.fb.group({
      name: ['', Validators.required],
      status: ['draft', Validators.required],
      scheduleAt: [''],
      variants: this.fb.array([this.createVariant(true)])
    });
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

  save(){ }
}
