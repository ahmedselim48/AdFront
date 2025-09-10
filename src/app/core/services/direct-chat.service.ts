import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { DirectConversation, DirectMessage } from '../../models/chat.models';

@Injectable({ providedIn: 'root' })
export class DirectChatService {
  constructor(private api: ApiClientService) {}

  // Direct Conversations
  createDirectConversation(payload: { otherUserId: string }): Observable<DirectConversation> {
    return this.api.post$('/DirectChat/conversations/get-or-create', payload);
  }
  
  listDirectConversations(): Observable<DirectConversation[]> { 
    return this.api.get$('/DirectChat/conversations'); 
  }
  
  getDirectConversation(conversationId: string): Observable<DirectConversation> { 
    return this.api.get$(`/DirectChat/conversations/${conversationId}`); 
  }

  // Direct Messages
  createDirectMessage(conversationId: string, payload: { content: string }): Observable<DirectMessage> {
    return this.api.post$(`/DirectChat/conversations/${conversationId}/messages`, payload);
  }
  
  listDirectMessages(conversationId: string): Observable<DirectMessage[]> {
    return this.api.get$(`/DirectChat/conversations/${conversationId}/messages`);
  }

  // Read/Close
  markDirectMessageRead(messageId: string): Observable<void> { 
    return this.api.put$(`/DirectChat/messages/${messageId}/read`, {}); 
  }
  
  markDirectConversationRead(conversationId: string): Observable<void> { 
    return this.api.put$(`/DirectChat/conversations/${conversationId}/read`, {}); 
  }
  
  closeDirectConversation(conversationId: string): Observable<void> { 
    return this.api.put$(`/DirectChat/conversations/${conversationId}/close`, {}); 
  }

  // Unread count
  unreadDirectCount(): Observable<number> { 
    return this.api.get$('/DirectChat/unread-count'); 
  }
}