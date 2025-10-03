import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DirectChatService } from '../../core/services/direct-chat.service';
import { MessagesService } from '../../core/services/messages.service';
import { SignalRService } from '../../core/services/signalr.service';
import { DirectMessage } from '../../models/chat.models';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-direct-chat-messages',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, MatTooltipModule, LucideAngularModule, RouterLink],
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
  otherUser?: { name: string; imageUrl?: string; isOnline: boolean; lastSeen?: Date };
  messageGroups: Array<{ date: string; messages: (DirectMessage & { isFirstInGroup: boolean; isDelivered: boolean; isRead: boolean; isEdited?: boolean })[] }> = [];
  searchTerm = '';
  filteredMessages: DirectMessage[] = [];
  editingMessageId?: string;
  editingMessageContent = '';
  private typingTimeout?: any;
  private signalR = inject(SignalRService);
  private auth = inject(AuthService);
  private messagesService = inject(MessagesService);
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
        this.filteredMessages = m;
        this.loading = false; 
        this.groupMessages();
        this.loadOtherUserInfo();
        setTimeout(() => this.scrollToBottom(), 0);
      }, 
      error: (err) => {
        console.error('Error loading messages:', err);
        this.loading = false;
      }
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value.toLowerCase();
    this.filterMessages();
  }

  clearSearch() {
    this.searchTerm = '';
    this.filterMessages();
  }

  editMessage(message: DirectMessage) {
    console.log('Starting edit for message:', message);
    this.editingMessageId = message.id;
    this.editingMessageContent = this.getMessageContent(message);
    console.log('Edit setup complete:', {
      editingMessageId: this.editingMessageId,
      editingMessageContent: this.editingMessageContent
    });
  }

  cancelEdit() {
    this.editingMessageId = undefined;
    this.editingMessageContent = '';
  }

  saveEdit(messageId: string) {
    if (this.editingMessageContent && this.editingMessageContent.trim()) {
      console.log('Saving edit for message:', messageId, 'with content:', this.editingMessageContent);
      
      // Show loading state
      const saveBtn = document.querySelector('.edit-save-btn') as HTMLButtonElement;
      if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>جاري الحفظ...</span>';
      }

      // Call edit message API
      this.messagesService.editMessage(messageId, this.editingMessageContent).subscribe({
        next: (response) => {
          console.log('Edit response:', response);
          if (response.success) {
            console.log('Message edited successfully');
            this.refresh();
            this.cancelEdit();
          } else {
            console.error('Error editing message:', response.message);
            alert('فشل في تعديل الرسالة: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Error editing message:', err);
          alert('فشل في تعديل الرسالة: ' + (err.error?.message || err.message || 'خطأ غير معروف'));
        },
        complete: () => {
          // Reset button state
          if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<lucide-icon name="check" size="14"></lucide-icon><span>حفظ</span>';
          }
        }
      });
    } else {
      console.log('Empty content, not saving');
      alert('لا يمكن حفظ رسالة فارغة');
    }
  }

  onEditKeydown(event: KeyboardEvent, messageId: string) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.saveEdit(messageId);
    } else if (event.key === 'Escape') {
      this.cancelEdit();
    }
  }

  onEditBlur(event: FocusEvent) {
    // Don't cancel edit on blur if clicking on save/cancel buttons
    const target = event.relatedTarget as HTMLElement;
    if (target && (target.classList.contains('edit-save-btn') || target.classList.contains('edit-cancel-btn'))) {
      return;
    }
    // Cancel edit after a short delay to allow button clicks
    setTimeout(() => {
      if (this.editingMessageId) {
        this.cancelEdit();
      }
    }, 100);
  }

  deleteMessage(messageId: string) {
    if (confirm('هل أنت متأكد من حذف هذه الرسالة؟')) {
      console.log('Deleting message:', messageId);
      // Call delete message API
      this.messagesService.deleteMessage(messageId).subscribe({
        next: (response) => {
          console.log('Delete response:', response);
          if (response.success) {
            this.refresh();
          } else {
            console.error('Error deleting message:', response.message);
            alert('فشل في حذف الرسالة: ' + response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting message:', err);
          alert('فشل في حذف الرسالة: ' + err.message);
        }
      });
    }
  }

  formatLastSeen(lastSeen?: Date | string): string {
    if (!lastSeen) return 'غير متصل';
    
    try {
      const date = new Date(lastSeen);
      if (isNaN(date.getTime())) return 'غير متصل';
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
      
      if (diffInHours < 1) {
        return 'آخر ظهور منذ دقائق';
      } else if (diffInHours < 24) {
        return `آخر ظهور منذ ${Math.floor(diffInHours)} ساعة`;
      } else if (diffInHours < 48) {
        return 'آخر ظهور أمس';
      } else {
        return `آخر ظهور منذ ${Math.floor(diffInHours / 24)} يوم`;
      }
    } catch (e) {
      return 'غير متصل';
    }
  }

  private filterMessages() {
    if (!this.searchTerm.trim()) {
      this.filteredMessages = [...this.messages];
    } else {
      this.filteredMessages = this.messages.filter(message => {
        const content = this.getMessageContent(message).toLowerCase();
        return content.includes(this.searchTerm);
      });
    }
    this.groupMessages();
  }

  private groupMessages() {
    const messagesToGroup = this.searchTerm ? this.filteredMessages : this.messages;
    
    if (!messagesToGroup.length) {
      this.messageGroups = [];
      return;
    }

    const groups = new Map<string, (DirectMessage & { isFirstInGroup: boolean; isDelivered: boolean; isRead: boolean })[]>();
    
    messagesToGroup.forEach((message, index) => {
      const date = new Date(message.createdAt).toDateString();
      const isFirstInGroup = index === 0 || 
        messagesToGroup[index - 1].senderId !== message.senderId ||
        new Date(messagesToGroup[index - 1].createdAt).toDateString() !== date;
      
      const enhancedMessage = {
        ...message,
        isFirstInGroup,
        isDelivered: true, // TODO: Get from API
        isRead: message.senderId === this.meId ? true : false // TODO: Get from API
      };

      if (!groups.has(date)) {
        groups.set(date, []);
      }
      groups.get(date)!.push(enhancedMessage);
    });

    this.messageGroups = Array.from(groups.entries()).map(([date, messages]) => ({
      date: this.formatDate(date),
      messages
    }));
  }

  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم'; // 'chat.today' | t
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'أمس'; // 'chat.yesterday' | t
    } else {
      return date.toLocaleDateString('ar-SA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  }

  private loadOtherUserInfo() {
    // Load other user info from conversation data
    this.messagesService.getConversation(this.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          const conversation = response.data;
          const me = this.auth.getCurrentUser()?.id;
          const amUser1 = me && conversation.user1Id === me;
          this.otherUser = {
            name: amUser1 ? conversation.user2Name : conversation.user1Name,
            imageUrl: amUser1 ? (conversation as unknown as Record<string, unknown>)['user2ImageUrl'] as string : (conversation as unknown as Record<string, unknown>)['user1ImageUrl'] as string,
            isOnline: false, // TODO: Get from real-time data
            lastSeen: new Date()
          };
        } else {
          this.otherUser = {
            name: 'مستخدم',
            isOnline: false,
            lastSeen: new Date()
          };
        }
      },
      error: () => {
        this.otherUser = {
          name: 'مستخدم',
          isOnline: false,
          lastSeen: new Date()
        };
      }
    });
  }

  onTextareaInput(event: Event) {
    const textarea = event.target as HTMLTextAreaElement;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
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
        // Reset textarea height
        const textarea = document.querySelector('.message-textarea') as HTMLTextAreaElement;
        if (textarea) {
          textarea.style.height = 'auto';
        }
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
    // Handle different content types
    if (message.content === null || message.content === undefined) {
      return 'رسالة فارغة';
    }
    
    if (typeof message.content === 'string') {
      return message.content.trim() || 'رسالة فارغة';
    }
    
    if (typeof message.content === 'object') {
      const contentObj = message.content as Record<string, unknown>;
      
      // Try common property names
      if (contentObj['text'] && typeof contentObj['text'] === 'string') {
        return (contentObj['text'] as string).trim();
      }
      if (contentObj['message'] && typeof contentObj['message'] === 'string') {
        return (contentObj['message'] as string).trim();
      }
      if (contentObj['content'] && typeof contentObj['content'] === 'string') {
        return (contentObj['content'] as string).trim();
      }
      if (contentObj['body'] && typeof contentObj['body'] === 'string') {
        return (contentObj['body'] as string).trim();
      }
      
      // If it's an array, try to join
      if (Array.isArray(contentObj)) {
        return contentObj.join(' ').trim() || 'رسالة فارغة';
      }
      
      // For complex objects, try to extract meaningful content
      if (contentObj['value'] && typeof contentObj['value'] === 'string') {
        return (contentObj['value'] as string).trim();
      }
      if (contentObj['data'] && typeof contentObj['data'] === 'string') {
        return (contentObj['data'] as string).trim();
      }
      
      // If it's a simple object with one property, try to use it
      const keys = Object.keys(contentObj);
      if (keys.length === 1 && typeof contentObj[keys[0]] === 'string') {
        return (contentObj[keys[0]] as string).trim();
      }
      
      // For complex objects, show a user-friendly message
      return 'رسالة تحتوي على محتوى متعدد';
    }
    
    // Convert to string safely
    try {
      const str = String(message.content);
      return str.trim() || 'رسالة فارغة';
    } catch (e) {
      return 'رسالة غير قابلة للعرض';
    }
  }
}
