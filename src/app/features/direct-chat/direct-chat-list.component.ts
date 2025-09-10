import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DirectChatService } from '../../core/services/direct-chat.service';
import { DirectConversation } from '../../models/chat.models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-direct-chat-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe],
  templateUrl: './direct-chat-list.component.html',
  styleUrls: ['./direct-chat-list.component.scss']
})
export class DirectChatListComponent implements OnDestroy {
  conversations: DirectConversation[] = [];
  loading = true;
  sub?: Subscription;
  
  constructor(private directChat: DirectChatService){
    this.sub = this.directChat.listDirectConversations().subscribe({ 
      next: cs => { 
        this.conversations = cs; 
        this.loading = false; 
      }, 
      error: () => this.loading = false 
    });
  }
  
  ngOnDestroy(){ 
    this.sub?.unsubscribe(); 
  }
}
