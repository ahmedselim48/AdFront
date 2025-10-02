import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule, Send, MessageCircle, User, Clock, Check, CheckCheck, MoreVertical, Search, Filter } from 'lucide-angular';
import { Subject, takeUntil } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

import { MessagesService } from '../../../../core/services/messages.service';
import { DirectConversationDto, DirectMessageDto, SendDirectMessageDto } from '../../../../models/profile.models';

@Component({
  selector: 'app-profile-messages',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatBadgeModule,
    MatDividerModule,
    MatTooltipModule,
    LucideAngularModule
  ],
  templateUrl: './profile-messages.component.html',
  styleUrls: ['./profile-messages.component.scss']
})
export class ProfileMessagesComponent implements OnInit, AfterViewInit, OnDestroy {
  conversations: DirectConversationDto[] = [];
  selectedConversation: DirectConversationDto | null = null;
  messages: DirectMessageDto[] = [];
  isLoading = false;
  isSending = false;
  loadingOlder = false;
  page = 1;

  // Search and filters
  searchTerm = '';
  showUnreadOnly = false;

  // Message form
  messageForm!: FormGroup;

  private destroy$ = new Subject<void>();
  private messagesService = inject(MessagesService);
  private toastr = inject(ToastrService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  @ViewChild('scrollContainer') scrollContainer?: ElementRef<HTMLDivElement>;
  autoScroll = true;

  // Messenger-like UI
  currentUserId?: string;
  dayGroups: { dateKey: string; label: string; messages: (DirectMessageDto & { isMine: boolean; isFirstInBlock: boolean; isLastInBlock: boolean; showAvatar: boolean; showName: boolean; })[] }[] = [];
  isTyping = false;

  ngOnInit() {
    this.initializeMessageForm();
    this.loadConversations();
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe(params => {
      const convId = params['conversationId'];
      if (convId) {
        const exists = this.conversations.find(c => c.id === convId);
        if (exists) this.selectConversation(exists);
        else {
          // fallback: load messages directly then refresh conversations
          this.selectConversation({ id: convId } as any);
        }
      }
    });
  }

  ngAfterViewInit(): void {
    const container = this.scrollContainer?.nativeElement;
    if (!container) return;
    container.addEventListener('scroll', () => {
      const threshold = 80;
      const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
      this.autoScroll = nearBottom;
      if (nearBottom && this.selectedConversation) {
        this.markAsRead(this.selectedConversation.id);
        this.messagesService.markDirectConversationAsReadViaSignalR(this.selectedConversation.id);
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeMessageForm() {
    this.messageForm = this.fb.group({
      content: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(2000)]]
    });
  }

  loadConversations() {
    this.isLoading = true;

    this.messagesService.getConversations().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.conversations = response.data;
          if (this.conversations.length > 0 && !this.selectedConversation) {
            this.selectConversation(this.conversations[0]);
          }
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading conversations:', error);
        this.toastr.error('فشل في تحميل المحادثات', 'خطأ');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  selectConversation(conversation: DirectConversationDto) {
    this.selectedConversation = conversation;
    this.loadMessages(conversation.id);
    this.cdr.markForCheck();
  }

  loadMessages(conversationId: string) {
    this.isLoading = true;

    this.messagesService.getMessages(conversationId, 1, 50).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success && response.data) {
          this.messages = response.data;
          this.markAsRead(conversationId);
          this.buildUi(this.messages);
          setTimeout(() => this.scrollToBottom(), 0);
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.toastr.error('فشل في تحميل الرسائل', 'خطأ');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private scrollToBottom() {
    const el = this.scrollContainer?.nativeElement;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }

  // Grouping and UI helpers
  private buildUi(messages: DirectMessageDto[]) {
    const byDay = new Map<string, any[]>();
    const withUi = messages.map((m, idx, arr) => {
      const prev = arr[idx - 1];
      const next = arr[idx + 1];
      const isMine = m.senderId === this.currentUserId;
      const samePrev = prev && prev.senderId === m.senderId;
      const sameNext = next && next.senderId === m.senderId;
      const ui = {
        ...m,
        isMine,
        isFirstInBlock: !samePrev,
        isLastInBlock: !sameNext,
        showAvatar: !isMine && (!sameNext),
        showName: !isMine && (!samePrev)
      };
      const dateKey = new Date(m.sentAt).toISOString().slice(0, 10);
      if (!byDay.has(dateKey)) byDay.set(dateKey, []);
      byDay.get(dateKey)!.push(ui);
      return ui;
    });
    const keys = Array.from(byDay.keys()).sort();
    this.dayGroups = keys.map(k => ({
      dateKey: k,
      label: this.humanizeDayLabel(k),
      messages: byDay.get(k)!
    }));
    
    this.cdr.markForCheck();
  }

  private humanizeDayLabel(dateKey: string): string {
    const d = new Date(dateKey);
    const today = new Date(); today.setHours(0,0,0,0);
    const day = new Date(d); day.setHours(0,0,0,0);
    const diff = (today.getTime() - day.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    return d.toLocaleDateString('ar-SA', { weekday: 'long', month: 'short', day: 'numeric' });
  }

  loadOlder() {
    if (!this.selectedConversation || this.loadingOlder) return;
    this.loadingOlder = true;
    const container = this.scrollContainer?.nativeElement;
    const prevHeight = container?.scrollHeight ?? 0;
    this.page += 1;
    this.messagesService.getMessages(this.selectedConversation.id, this.page, 50).pipe(takeUntil(this.destroy$)).subscribe({
      next: res => {
        const older = res?.data ?? [];
        this.messages = [...older, ...this.messages];
        this.buildUi(this.messages);
        setTimeout(() => {
          if (container) {
            const newHeight = container.scrollHeight;
            container.scrollTop = newHeight - prevHeight;
          }
          this.loadingOlder = false;
        }, 0);
      },
      error: () => this.loadingOlder = false
    });
  }

  onComposerKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendMessage();
    }
  }

  sendMessage() {
    if (this.messageForm.valid && this.selectedConversation) {
      this.isSending = true;

      const messageData: SendDirectMessageDto = {
        directConversationId: this.selectedConversation.id,
        content: this.messageForm.value.content
      };

      this.messagesService.sendMessage(this.selectedConversation.id, messageData).pipe(takeUntil(this.destroy$)).subscribe({
        next: (response: any) => {
          if (response && response.success && response.data) {
            // Add the new message to the messages array
            const newMessage: DirectMessageDto = {
              id: response.data.id,
              directConversationId: this.selectedConversation!.id,
              senderId: response.data.senderId,
              senderName: response.data.senderName,
              content: response.data.content,
              sentAt: response.data.sentAt,
              messageType: response.data.messageType,
              isRead: false,
              isAutoReply: false,
              status: response.data.status
            };

            this.messages.push(newMessage);
            this.messageForm.reset();

            // Update conversation's last message
            this.updateConversationLastMessage(newMessage);
          } else {
            this.toastr.error('فشل في إرسال الرسالة', 'خطأ');
          }
          this.isSending = false;
        },
        error: (error: any) => {
          console.error('Error sending message:', error);
          this.toastr.error('فشل في إرسال الرسالة', 'خطأ');
          this.isSending = false;
        }
      });
    }
  }

  private updateConversationLastMessage(message: DirectMessageDto) {
    if (this.selectedConversation) {
      this.selectedConversation.lastMessage = message;
      this.selectedConversation.lastMessageAt = message.sentAt;
    }
  }

  markAsRead(conversationId: string) {
    this.messagesService.markConversationAsRead(conversationId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          // Update conversation unread count
          const conversation = this.conversations.find(c => c.id === conversationId);
          if (conversation) {
            conversation.unreadMessageCount = 0;
          }
        }
      },
      error: (error: any) => {
        console.error('Error marking conversation as read:', error);
      }
    });
  }

  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  onToggleUnreadOnly() {
    this.showUnreadOnly = !this.showUnreadOnly;
  }

  getFilteredConversations(): DirectConversationDto[] {
    let filtered = [...this.conversations];

    // Search filter
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(conv =>
        conv.user1Name.toLowerCase().includes(searchLower) ||
        conv.user2Name.toLowerCase().includes(searchLower) ||
        conv.lastMessage?.content.toLowerCase().includes(searchLower)
      );
    }

    // Unread only filter
    if (this.showUnreadOnly) {
      filtered = filtered.filter(conv => conv.unreadMessageCount > 0);
    }

    // Sort by last message time
    return filtered.sort((a, b) => {
      const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
      const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
      return timeB - timeA;
    });
  }

  getOtherUserName(conversation: DirectConversationDto): string {
    // This would need to be determined based on current user ID
    // For now, we'll use user2Name as a placeholder
    return conversation.user2Name;
  }

  getOtherUserInitials(conversation: DirectConversationDto): string {
    const name = this.getOtherUserName(conversation);
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatMessageTime(date: string): string {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInHours < 168) { // 7 days
      return messageDate.toLocaleDateString('ar-SA', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } else {
      return messageDate.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  formatConversationTime(date: string): string {
    const convDate = new Date(date);
    const now = new Date();
    const diffInDays = (now.getTime() - convDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffInDays < 1) {
      return convDate.toLocaleTimeString('ar-SA', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } else if (diffInDays < 7) {
      return convDate.toLocaleDateString('ar-SA', {
        weekday: 'short'
      });
    } else {
      return convDate.toLocaleDateString('ar-SA', {
        month: 'short',
        day: 'numeric'
      });
    }
  }

  getMessageStatusIcon(message: DirectMessageDto): string {
    if (message.isRead) {
      return 'check-check';
    } else if (message.status === 'Delivered') {
      return 'check';
    } else {
      return 'clock';
    }
  }

  getMessageStatusColor(message: DirectMessageDto): string {
    if (message.isRead) {
      return 'primary';
    } else if (message.status === 'Delivered') {
      return 'accent';
    } else {
      return 'warn';
    }
  }

  onRefresh() {
    this.loadConversations();
    this.toastr.success('تم تحديث المحادثات', 'تم');
  }

  trackByConversationId(index: number, conversation: DirectConversationDto): string {
    return conversation.id;
  }

  trackByMessageId(index: number, message: DirectMessageDto): string {
    return message.id;
  }

  // New UX methods
  getUnreadCount(): number {
    return this.conversations.reduce((total, conv) => total + (conv.unreadMessageCount || 0), 0);
  }

  markAllAsRead() {
    this.conversations.forEach(conv => {
      if (conv.unreadMessageCount > 0) {
        this.markAsRead(conv.id);
        conv.unreadMessageCount = 0;
      }
    });
    this.toastr.success('تم تعليم جميع الرسائل كمقروءة', 'تم');
  }

  isUserOnline(conversation: DirectConversationDto): boolean {
    // Mock implementation - in real app, check SignalR connection status
    // Use conversation ID as seed for consistent results
    const seed = conversation.id.charCodeAt(0) + conversation.id.charCodeAt(1);
    return (seed % 3) === 0; // Consistent 33% chance based on conversation ID
  }

}
