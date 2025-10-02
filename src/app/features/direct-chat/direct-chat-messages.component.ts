import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectChatService } from '../../core/services/direct-chat.service';
import { SignalRService } from '../../core/services/signalr.service';
import { DirectMessage } from '../../models/chat.models';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-direct-chat-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, MatTooltipModule, LucideAngularModule],
  templateUrl: './direct-chat-messages.component.html',
  styleUrls: ['./direct-chat-messages.component.scss']
})
export class DirectChatMessagesComponent implements OnInit, OnDestroy {
  id!: string;
  messages: DirectMessage[] = [];
  loading = true;
  form!: FormGroup;
  meId?: string;
  isTyping = false;
  private typingTimeout?: any;
  private signalR = inject(SignalRService);
  private auth = inject(AuthService);
  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  
  constructor(
    private route: ActivatedRoute, 
    private directChat: DirectChatService, 
    private fb: FormBuilder
  ){
    this.id = this.route.snapshot.paramMap.get('id') ?? '';
    this.form = this.fb.group({ content: ['', Validators.required] });
    this.meId = this.auth.getCurrentUser()?.id;
  }

  ngOnInit() {
    this.refresh();
    // Join SignalR group
    this.signalR.joinDirectConversation(this.id);
    // react to typing from peer
    this.signalR.directTyping$.subscribe(t => {
      if (!t) return;
      if (t.conversationId === this.id) {
        this.isTyping = t.isTyping;
      }
    });
  }

  ngOnDestroy(): void {
    this.signalR.leaveDirectConversation(this.id);
  }
  
  refresh(){
    this.directChat.listDirectMessages(this.id).subscribe({ 
      next: m => { 
        console.log('Raw messages from API:', m);
        this.messages = m; 
        this.loading = false; 
        setTimeout(() => this.scrollToBottom(), 0);
      }, 
      error: (err) => {
        console.error('Error loading messages:', err);
        this.loading = false;
      }
    });
  }
  
  send(){
    if(this.form.invalid) return;
    const content = this.form.get('content')?.value ?? '';
    console.log('Sending message with content:', content);
    const payload = { content: content };
    this.directChat.createDirectMessage(this.id, payload).subscribe({ 
      next: (response) => { 
        console.log('Message sent successfully:', response);
        this.form.reset(); 
        this.refresh(); 
        this.signalR.sendDirectTyping(this.id, false);
      },
      error: (err) => {
        console.error('Error sending message:', err);
      }
    });
  }

  onKeydown(e: KeyboardEvent){
    if(e.key === 'Enter' && !e.shiftKey){
      e.preventDefault();
      this.send();
      return;
    }
    
    // Only send typing if we have content
    const content = this.form.get('content')?.value;
    if (content && content.trim().length > 0) {
      this.isTyping = true;
      this.signalR.sendDirectTyping(this.id, true).catch(err => {
        console.warn('Failed to send typing status:', err);
      });
      
      clearTimeout(this.typingTimeout);
      this.typingTimeout = setTimeout(() => {
        this.isTyping = false;
        this.signalR.sendDirectTyping(this.id, false).catch(err => {
          console.warn('Failed to send typing stop:', err);
        });
      }, 1200);
    }
  }

  private scrollToBottom(){
    const el = this.scrollContainer?.nativeElement;
    if(el){ el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' }); }
  }

  getMessageContent(message: DirectMessage): string {
    // Debug logging
    console.log('Message content debug:', {
      content: message.content,
      type: typeof message.content,
      message: message
    });
    
    // Handle different content types
    if (message.content === null || message.content === undefined) {
      return 'رسالة فارغة';
    }
    
    if (typeof message.content === 'string') {
      return message.content.trim() || 'رسالة فارغة';
    }
    
    if (typeof message.content === 'object') {
      const contentObj = message.content as any;
      
      // Try common property names
      if (contentObj.text && typeof contentObj.text === 'string') {
        return contentObj.text.trim();
      }
      if (contentObj.message && typeof contentObj.message === 'string') {
        return contentObj.message.trim();
      }
      if (contentObj.content && typeof contentObj.content === 'string') {
        return contentObj.content.trim();
      }
      if (contentObj.body && typeof contentObj.body === 'string') {
        return contentObj.body.trim();
      }
      
      // If it's an array, try to join
      if (Array.isArray(contentObj)) {
        return contentObj.join(' ').trim() || 'رسالة فارغة';
      }
      
      // Last resort: stringify with better formatting
      try {
        const jsonStr = JSON.stringify(contentObj, null, 2);
        return jsonStr.length > 100 ? jsonStr.substring(0, 100) + '...' : jsonStr;
      } catch (e) {
        return 'رسالة غير قابلة للعرض';
      }
    }
    
    // Convert to string
    const str = String(message.content);
    return str.trim() || 'رسالة فارغة';
  }
}
