import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DirectChatService, DirectConversationDto } from '../../core/services/direct-chat.service';
import { AuthService } from '../../core/auth/auth.service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LucideAngularModule } from 'lucide-angular';
import { Subscription } from 'rxjs';

interface ConversationViewModel {
  id: string;
  otherName: string;
  otherImageUrl?: string;
  lastMessage?: string;
  lastAt?: Date | string;
  unreadCount: number;
  isOnline?: boolean;
  isLastMessageFromMe?: boolean;
}

@Component({
  selector: 'app-direct-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MatTooltipModule, LucideAngularModule],
  templateUrl: './direct-chat-list.component.html',
  styleUrls: ['./direct-chat-list.component.scss']
})
export class DirectChatListComponent implements OnInit, OnDestroy {
  conversations: ConversationViewModel[] = [];
  filteredConversations: ConversationViewModel[] = [];
  loading = true;
  searchTerm = '';
  showUnreadOnly = false;
  selectedConversationId?: string;
  sub?: Subscription;
  
  constructor(
    private directChat: DirectChatService, 
    private auth: AuthService,
    private route: ActivatedRoute
  ){}

  ngOnInit() {
    this.loadConversations();
    this.route.params.subscribe(params => {
      this.selectedConversationId = params['id'];
    });
  }
  
  private loadConversations() {
    this.sub = this.directChat.listDirectConversations().subscribe({
      next: (cs: DirectConversationDto[]) => {
        const me = this.auth.currentUser?.id;
        // Hide empty conversations that have no messages and no unread
        const meaningful = (cs || []).filter(c => (c.lastMessage && String(c.lastMessage).trim()) || c.lastMessageTime || (c.unreadCount && c.unreadCount > 0));
        this.conversations = meaningful.map(c => {
          const amUser1 = me && c.user1Id === me;
          const otherName = amUser1 ? c.user2Name : c.user1Name;
          const otherImageUrl = amUser1 ? c.user2ImageUrl : c.user1ImageUrl;
          return {
            id: c.id,
            otherName,
            otherImageUrl,
            lastMessage: c.lastMessage,
            lastAt: c.lastMessageTime || c.updatedAt || c.createdAt,
            unreadCount: c.unreadCount || 0,
            isOnline: false, // TODO: Get from real-time data
            isLastMessageFromMe: false // TODO: Determine from message data
          } as ConversationViewModel;
        });
        this.filterConversations();
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchTerm = target.value;
    this.filterConversations();
  }

  private filterConversations() {
    let filtered = [...this.conversations];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(c => 
        c.otherName.toLowerCase().includes(searchLower) ||
        (c.lastMessage && c.lastMessage.toLowerCase().includes(searchLower))
      );
    }

    // Filter by unread only
    if (this.showUnreadOnly) {
      filtered = filtered.filter(c => c.unreadCount > 0);
    }

    // Sort by last message time
    filtered.sort((a, b) => {
      const timeA = new Date(a.lastAt || 0).getTime();
      const timeB = new Date(b.lastAt || 0).getTime();
      return timeB - timeA;
    });

    this.filteredConversations = filtered;
  }

  formatTime(date?: Date | string): string {
    if (!date) return '';
    
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'الآن'; // 'chat.now' | t
    } else if (diffInHours < 24) {
      return messageDate.toLocaleTimeString('ar-SA', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else if (diffInHours < 48) {
      return 'أمس'; // 'chat.yesterday' | t
    } else {
      return messageDate.toLocaleDateString('ar-SA', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  }

  get totalUnreadCount(): number {
    return this.conversations.reduce((total, c) => total + c.unreadCount, 0);
  }

  getMessageContent(message: string | Record<string, unknown> | null | undefined): string {
    if (!message) return 'لا توجد رسائل';
    
    if (typeof message === 'string') {
      return message.trim() || 'لا توجد رسائل';
    }
    
    if (typeof message === 'object') {
      const messageObj = message as Record<string, unknown>;
      
      // Try common property names
      if (messageObj['text'] && typeof messageObj['text'] === 'string') {
        return (messageObj['text'] as string).trim();
      }
      if (messageObj['content'] && typeof messageObj['content'] === 'string') {
        return (messageObj['content'] as string).trim();
      }
      if (messageObj['message'] && typeof messageObj['message'] === 'string') {
        return (messageObj['message'] as string).trim();
      }
      if (messageObj['body'] && typeof messageObj['body'] === 'string') {
        return (messageObj['body'] as string).trim();
      }
      
      // If it's an array, try to join
      if (Array.isArray(message)) {
        return message.join(' ').trim() || 'لا توجد رسائل';
      }
      
      // For complex objects, try to extract meaningful content
      if (messageObj['value'] && typeof messageObj['value'] === 'string') {
        return (messageObj['value'] as string).trim();
      }
      if (messageObj['data'] && typeof messageObj['data'] === 'string') {
        return (messageObj['data'] as string).trim();
      }
      
      // If it's a simple object with one property, try to use it
      const keys = Object.keys(messageObj);
      if (keys.length === 1 && typeof messageObj[keys[0]] === 'string') {
        return (messageObj[keys[0]] as string).trim();
      }
      
      // For complex objects, show a user-friendly message
      return 'رسالة تحتوي على محتوى متعدد';
    }
    
    // Convert to string safely
    try {
      const str = String(message);
      return str.trim() || 'لا توجد رسائل';
    } catch (e) {
      return 'رسالة غير قابلة للعرض';
    }
  }
  
  ngOnDestroy(){ 
    this.sub?.unsubscribe(); 
  }
}
