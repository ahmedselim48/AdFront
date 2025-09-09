import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ChatService } from '../../core/services/chat.service';
import { Message } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-chat-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './chat-messages.component.html',
  styleUrls: ['./chat-messages.component.scss']
})
export class ChatMessagesComponent {
  id!: string;
  messages: Message[] = [];
  loading = true;
  form!: FormGroup;
  constructor(private route: ActivatedRoute, private chat: ChatService, private fb: FormBuilder){
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.form = this.fb.group({ content: ['', Validators.required] });
    this.refresh();
  }
  refresh(){
    this.chat.listMessages(this.id).subscribe({ next: m => { this.messages = m; this.loading = false; }, error: ()=> this.loading=false });
  }
  send(){
    if(this.form.invalid) return;
    const payload = { content: this.form.get('content')?.value ?? '' };
    this.chat.createMessage(this.id, payload).subscribe({ next: () => { this.form.reset(); this.refresh(); } });
  }
}
