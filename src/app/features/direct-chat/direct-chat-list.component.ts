import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DirectChatService, DirectConversationDto } from '../../core/services/direct-chat.service';
import { AuthService } from '../../core/auth/auth.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Subscription } from 'rxjs';

interface ConversationViewModel {
  id: string;
  otherName: string;
  otherImageUrl?: string;
  lastMessage?: string;
  lastAt?: Date | string;
  unreadCount: number;
}

@Component({
  selector: 'app-direct-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './direct-chat-list.component.html',
  styleUrls: ['./direct-chat-list.component.scss']
})
export class DirectChatListComponent implements OnDestroy {
  conversations: ConversationViewModel[] = [];
  loading = true;
  sub?: Subscription;
  
  constructor(private directChat: DirectChatService, private auth: AuthService){
    this.sub = this.directChat.listDirectConversations().subscribe({
      next: (cs: DirectConversationDto[]) => {
        const me = this.auth.currentUser?.id;
        this.conversations = (cs || []).map(c => {
          const amUser1 = me && c.user1Id === me;
          const otherName = amUser1 ? c.user2Name : c.user1Name;
          const otherImageUrl = amUser1 ? c.user2ImageUrl : c.user1ImageUrl;
          return {
            id: c.id,
            otherName,
            otherImageUrl,
            lastMessage: c.lastMessage,
            lastAt: c.lastMessageTime || c.updatedAt || c.createdAt,
            unreadCount: c.unreadCount || 0
          } as ConversationViewModel;
        });
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }
  
  ngOnDestroy(){ 
    this.sub?.unsubscribe(); 
  }
}
