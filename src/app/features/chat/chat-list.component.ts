import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatService } from '../../core/services/chat.service';
import { Conversation } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss']
})
export class ChatListComponent implements OnDestroy {
  conversations: Conversation[] = [];
  loading = true;
  sub?: Subscription;
  constructor(private chat: ChatService){
    this.sub = this.chat.listConversations().subscribe({ next: cs => { this.conversations = cs; this.loading = false; }, error: ()=> this.loading = false });
  }
  ngOnDestroy(){ this.sub?.unsubscribe(); }
}
