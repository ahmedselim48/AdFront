import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DirectChatService } from '../../core/services/direct-chat.service';
import { DirectMessage } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-direct-chat-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './direct-chat-messages.component.html',
  styleUrls: ['./direct-chat-messages.component.scss']
})
export class DirectChatMessagesComponent {
  id!: string;
  messages: DirectMessage[] = [];
  loading = true;
  form!: FormGroup;
  
  constructor(
    private route: ActivatedRoute, 
    private directChat: DirectChatService, 
    private fb: FormBuilder
  ){
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.form = this.fb.group({ content: ['', Validators.required] });
    this.refresh();
  }
  
  refresh(){
    this.directChat.listDirectMessages(this.id).subscribe({ 
      next: m => { 
        this.messages = m; 
        this.loading = false; 
      }, 
      error: () => this.loading = false 
    });
  }
  
  send(){
    if(this.form.invalid) return;
    const payload = { content: this.form.get('content')?.value ?? '' };
    this.directChat.createDirectMessage(this.id, payload).subscribe({ 
      next: () => { 
        this.form.reset(); 
        this.refresh(); 
      } 
    });
  }
}
