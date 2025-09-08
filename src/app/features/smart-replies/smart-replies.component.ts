import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-smart-replies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './smart-replies.component.html',
  styleUrls: ['./smart-replies.component.scss']
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
