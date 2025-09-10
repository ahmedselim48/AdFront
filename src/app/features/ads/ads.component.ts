import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { FileService } from '../../core/services/file.service';
import { AdsService } from './ads.service';
import { OpenAiService } from '../../infrastructure/openai/openai.service';

@Component({
  selector: 'app-ads',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './ads.component.html',
  styleUrls: ['./ads.component.scss']
})
export class AdsComponent {
  form!: FormGroup;
  saving = false;
  generating = false;

  get variants(){ return this.form.get('variants') as FormArray<FormGroup>; }

  constructor(private fb: FormBuilder, private fileSvc: FileService, private ads: AdsService, private ai: OpenAiService){
    this.form = this.fb.group({
      name: ['', Validators.required],
      category: [''],
      price: [null],
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
    this.ads.create(this.form.value).subscribe({
      next: () => { this.saving = false; this.form.reset({ name: '', category: '', price: null, status: 'draft', scheduleAt: '' }); this.variants.clear(); this.variants.push(this.createVariant(true)); },
      error: () => { this.saving = false; }
    });
  }
}
