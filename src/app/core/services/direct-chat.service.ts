import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { Conversation, Message, UnreadCount } from '../../models/chat.models';

@Injectable({ providedIn: 'root' })
export class DirectChatService {
  constructor(private api: ApiClientService) {}

  // Conversations
  createConversation(payload: Partial<Conversation>): Observable<Conversation> { return this.api.post$('/DirectChat/conversations', payload); }
  listConversations(): Observable<Conversation[]> { return this.api.get$('/DirectChat/conversations'); }
  getOrCreate(payload: Partial<Conversation>): Observable<Conversation> { return this.api.post$('/DirectChat/conversations/get-or-create', payload); }
  getConversation(conversationId: string): Observable<Conversation> { return this.api.get$(`/DirectChat/conversations/${conversationId}`); }

  // Messages
  createMessage(conversationId: string, payload: Partial<Message>): Observable<Message> {
    return this.api.post$(`/DirectChat/conversations/${conversationId}/messages`, payload);
  }
  listMessages(conversationId: string): Observable<Message[]> { return this.api.get$(`/DirectChat/conversations/${conversationId}/messages`); }

  // Read/Close
  markMessageRead(messageId: string): Observable<void> { return this.api.put$(`/DirectChat/messages/${messageId}/read`, {}); }
  markConversationRead(conversationId: string): Observable<void> { return this.api.put$(`/DirectChat/conversations/${conversationId}/read`, {}); }
  closeConversation(conversationId: string): Observable<void> { return this.api.put$(`/DirectChat/conversations/${conversationId}/close`, {}); }

  // Unread count
  unreadCount(): Observable<UnreadCount> { return this.api.get$('/DirectChat/unread-count'); }
}
