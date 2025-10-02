import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessagesService } from '../../../core/services/messages.service';
import { AuthService } from '../../../core/auth/auth.service';

interface ConversationItem {
  id: string;
  otherName: string;
  otherImageUrl?: string;
  lastMessage?: string;
  lastAt?: string | Date;
  unreadCount: number;
}

@Component({
  selector: 'app-navbar-chat',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar-chat.component.html',
  styleUrls: ['./navbar-chat.component.scss']
})
export class NavbarChatComponent implements OnInit, OnDestroy {
  private messages = inject(MessagesService);
  private auth = inject(AuthService);
  private router = inject(Router);

  conversations: ConversationItem[] = [];
  unreadTotal = 0;
  loading = true;
  sub = new Subscription();

  ngOnInit(): void {
    this.fetchConversations();
    this.fetchUnreadTotal();

    this.sub.add(this.messages.newMessage$.subscribe(() => {
      this.fetchConversations(false);
      this.fetchUnreadTotal();
    }));
    this.sub.add(this.messages.conversationUpdated$.subscribe(() => {
      this.fetchConversations(false);
      this.fetchUnreadTotal();
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  fetchConversations(reset = true) {
    this.loading = true;
    this.messages.getConversations().subscribe({
      next: (res: any) => {
        const me = this.auth.getCurrentUser()?.id || this.auth.currentUser?.id;
        const cs = res?.data || [];
        const items = cs.map((c: any) => {
          const amUser1 = me && c.user1Id === me;
          const otherName = amUser1 ? c.user2Name : c.user1Name;
          const otherImageUrl = amUser1 ? c.user2ImageUrl : c.user1ImageUrl;
          return {
            id: c.id,
            otherName,
            otherImageUrl,
            lastMessage: c.lastMessage?.content || c.lastMessage,
            lastAt: c.lastMessageAt || c.lastMessageTime || c.updatedAt || c.createdAt,
            unreadCount: c.unreadMessageCount || c.unreadCount || 0
          } as ConversationItem;
        });
        this.conversations = items;
        this.loading = false;
      },
      error: () => this.loading = false
    });
  }

  fetchUnreadTotal() {
    this.messages.getUnreadDirectMessageCount().subscribe({
      next: (res: any) => this.unreadTotal = res?.data ?? 0,
      error: () => {}
    });
  }

  openConversation(c: ConversationItem) {
    this.router.navigate(['/profile/messages'], { queryParams: { conversationId: c.id } });
  }

  goToMessagesPage() {
    this.router.navigate(['/profile/messages']);
  }
}


