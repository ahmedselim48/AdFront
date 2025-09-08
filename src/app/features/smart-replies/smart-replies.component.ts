import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-smart-replies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <section class="smart-wrap">
    <h2>Smart Replies</h2>
    <form [formGroup]="form" (ngSubmit)="generate()" class="row">
      <input placeholder="Customer message..." formControlName="message">
      <button type="submit" [disabled]="form.invalid || loading">Generate</button>
    </form>
    <div class="result" *ngIf="reply">
      <h3>Suggested Reply</h3>
      <pre>{{ reply }}</pre>
    </div>
    <div class="templates">
      <h3>Templates</h3>
      <ul>
        <li *ngFor="let t of templates" (click)="form.patchValue({message: t})">{{t}}</li>
      </ul>
    </div>
  </section>
  `,
  styles: [`.row{display:flex;gap:.5rem}
  input{flex:1;padding:.5rem;border:1px solid #e5e7eb;border-radius:.375rem}
  button{padding:.5rem .75rem;border-radius:.375rem;border:1px solid #111827;background:#111827;color:#fff}
  .result{margin-top:1rem;border:1px solid #e5e7eb;border-radius:.5rem;padding:.75rem}
  ul{list-style:none;padding:0;display:flex;gap:.5rem;flex-wrap:wrap}
  li{padding:.25rem .5rem;border:1px solid #e5e7eb;border-radius:.375rem;cursor:pointer}`]
})
export class SmartRepliesComponent {
  form = this.fb.group({ message: ['', Validators.required] });
  loading = false;
  reply = '';
  templates = [
    'Thanks for reaching out! Can you share your order number?',
    'We appreciate your feedback. Could you provide more details?'
  ];
  constructor(private fb: FormBuilder, private http: HttpClient){}
  generate(){
    if(this.form.invalid) return;
    this.loading = true;
    this.http.post<{reply:string}>(`${environment.openAiProxyUrl}/smart-replies`, { message: this.form.value.message }).subscribe({
      next: r => { this.reply = r.reply; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
