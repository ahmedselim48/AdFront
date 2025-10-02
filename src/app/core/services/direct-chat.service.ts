import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';

export interface DirectConversationDto {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  user1ImageUrl?: string;
  user2ImageUrl?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
  isActive: boolean;
  status: 'Active' | 'Closed' | 'Archived';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  messageType: 'Text' | 'Image' | 'File' | 'System';
  isRead: boolean;
  createdAt: Date;
}

export interface CreateDirectConversationDto {
  otherUserId: string;
  initialMessage?: string;
}

export interface SendDirectMessageDto {
  directConversationId: string;
  content: string;
  messageType?: 'Text' | 'Image' | 'File';
}

@Injectable({
  providedIn: 'root'
})
export class DirectChatService {
  private readonly apiUrl = `${environment.apiUrl}/api/directchat`;

  constructor(private http: HttpClient) {}

  // Create or get direct conversation
  getOrCreateConversation(otherUserId: string): Observable<GeneralResponse<DirectConversationDto>> {
    return this.http.post<GeneralResponse<DirectConversationDto>>(
      `${this.apiUrl}/conversations/get-or-create`,
      { otherUserId }
    );
  }

  // Get user conversations
  getUserConversations(): Observable<GeneralResponse<DirectConversationDto[]>> {
    return this.http.get<GeneralResponse<DirectConversationDto[]>>(`${this.apiUrl}/conversations`);
  }

  // Get conversation messages
  getConversationMessages(
    conversationId: string,
    page: number = 1,
    pageSize: number = 50
  ): Observable<GeneralResponse<ChatMessageDto[]>> {
    return this.http.get<GeneralResponse<ChatMessageDto[]>>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { params: { page: page.toString(), pageSize: pageSize.toString() } }
    );
  }

  // Send message
  sendMessage(conversationId: string, content: string): Observable<GeneralResponse<ChatMessageDto>> {
    return this.http.post<GeneralResponse<ChatMessageDto>>(
      `${this.apiUrl}/conversations/${conversationId}/messages`,
      { content, messageType: 'Text' }
    );
  }

  // Mark message as read
  markMessageAsRead(messageId: string): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(
      `${this.apiUrl}/messages/${messageId}/read`,
      {}
    );
  }

  // Mark conversation as read
  markConversationAsRead(conversationId: string): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(
      `${this.apiUrl}/conversations/${conversationId}/read`,
      {}
    );
  }

  // Get unread count
  getUnreadCount(): Observable<GeneralResponse<number>> {
    return this.http.get<GeneralResponse<number>>(`${this.apiUrl}/unread-count`);
  }

  // Legacy methods for backward compatibility
  listDirectConversations(): Observable<DirectConversationDto[]> {
    return new Observable(observer => {
      this.getUserConversations().subscribe({
        next: (response) => {
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (error) => {
          observer.error(error);
        }
      });
    });
  }

  listDirectMessages(conversationId: string): Observable<ChatMessageDto[]> {
    return new Observable(observer => {
      // Use the correct direct chat endpoint
      this.http.get<GeneralResponse<ChatMessageDto[]>>(
        `${this.apiUrl}/conversations/${conversationId}/messages`
      ).subscribe({
        next: (response) => {
          console.log('Direct chat messages response:', response);
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.next([]);
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Error loading direct chat messages:', error);
          observer.error(error);
        }
      });
    });
  }

  createDirectMessage(conversationId: string, payload: { content: string }): Observable<ChatMessageDto> {
    return new Observable(observer => {
      // Use the correct direct chat endpoint
      this.http.post<GeneralResponse<ChatMessageDto>>(
        `${this.apiUrl}/conversations/${conversationId}/messages`,
        { content: payload.content, messageType: 'Text' }
      ).subscribe({
        next: (response) => {
          console.log('Direct chat send message response:', response);
          if (response.success && response.data) {
            observer.next(response.data);
          } else {
            observer.error(new Error('Failed to send message'));
          }
          observer.complete();
        },
        error: (error) => {
          console.error('Error sending direct chat message:', error);
          observer.error(error);
        }
      });
    });
  }
}