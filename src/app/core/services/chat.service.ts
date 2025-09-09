import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from './api-client.service';
import { Conversation, Message, ReplyTemplate, UnreadCount } from '../../models/chat.models';

@Injectable({ providedIn: 'root' })
export class ChatService {
  constructor(private api: ApiClientService) {}

  // Conversations
  createConversation(payload: Partial<Conversation>): Observable<Conversation> {
    return this.api.post$('/Chat/conversations', payload);
  }
  listConversations(): Observable<Conversation[]> { return this.api.get$('/Chat/conversations'); }
  getConversation(conversationId: string): Observable<Conversation> { return this.api.get$(`/Chat/conversations/${conversationId}`); }

  // Messages
  createMessage(conversationId: string, payload: Partial<Message>): Observable<Message> {
    return this.api.post$(`/Chat/conversations/${conversationId}/messages`, payload);
  }
  listMessages(conversationId: string): Observable<Message[]> {
    return this.api.get$(`/Chat/conversations/${conversationId}/messages`);
  }

  // Read/Close
  markMessageRead(messageId: string): Observable<void> { return this.api.put$(`/Chat/messages/${messageId}/read`, {}); }
  markConversationRead(conversationId: string): Observable<void> { return this.api.put$(`/Chat/conversations/${conversationId}/read`, {}); }
  closeConversation(conversationId: string): Observable<void> { return this.api.put$(`/Chat/conversations/${conversationId}/close`, {}); }

  // Unread count
  unreadCount(): Observable<UnreadCount> { return this.api.get$('/Chat/unread-count'); }

  // Reply Templates
  createTemplate(payload: Partial<ReplyTemplate>): Observable<ReplyTemplate> { return this.api.post$('/Chat/reply-templates', payload); }
  listTemplates(): Observable<ReplyTemplate[]> { return this.api.get$('/Chat/reply-templates'); }
  updateTemplate(payload: ReplyTemplate): Observable<ReplyTemplate> { return this.api.put$('/Chat/reply-templates', payload); }
  getTemplate(templateId: string): Observable<ReplyTemplate> { return this.api.get$(`/Chat/reply-templates/${templateId}`); }
  deleteTemplate(templateId: string): Observable<void> { return this.api.delete$(`/Chat/reply-templates/${templateId}`); }
}
