import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { ReplyTemplate } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-reply-templates',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.scss']
})
export class TemplatesComponent {
  items: ReplyTemplate[] = [];
  loading = true;
  form!: FormGroup;
  constructor(private chat: ChatService, private fb: FormBuilder){
    this.form = this.fb.group({ title: ['', Validators.required], body: ['', Validators.required] });
    this.load();
  }
  load(){ this.chat.getTemplates().subscribe({ next: i => { this.items = i; this.loading=false; } }); }
  save(){
    if(this.form.invalid) return;
    const payload = {
      name: this.form.get('title')?.value ?? '',
      content: this.form.get('body')?.value ?? '',
      type: 'Manual' as any,
      intent: 'Other' as any,
      userId: ''
    };
    this.chat.createTemplate(payload).subscribe({ next: () => { this.form.reset(); this.load(); } });
  }
  remove(id: string){ /* TODO: Implement delete template method */ this.load(); }
}
