import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ChatService } from '../../core/services/chat.service';
import { ReplyTemplate } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-smart-replies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './smart-replies.component.html',
  styleUrls: ['./smart-replies.component.scss']
})
export class SmartRepliesComponent {
  form!: FormGroup;
  loading = false;
  reply = '';
  templates: string[] = [];
  constructor(private fb: FormBuilder, private http: HttpClient, private chat: ChatService){
    this.form = this.fb.group({ message: ['', Validators.required] });
    this.loadTemplates();
  }
  generate(){
    if(this.form.invalid) return;
    this.loading = true;
    this.http.post<{reply:string}>(`${environment.openAiProxyUrl}/smart-replies`, { message: this.form.value.message }).subscribe({
      next: r => { this.reply = r.reply; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  useReply(reply: any): void {
    this.reply = reply;
  }

  saveTemplate(reply: any): void {
    this.chat.createTemplate({ title: reply.slice(0, 40), body: reply }).subscribe(() => this.loadTemplates());
  }

  private loadTemplates(){
    this.chat.listTemplates().subscribe((list: ReplyTemplate[]) => {
      this.templates = list.map(t => t.body || t.title);
    });
  }
}
