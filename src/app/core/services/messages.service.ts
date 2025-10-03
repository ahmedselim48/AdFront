import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, Subject, takeUntil } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';
import { 
  DirectConversationDto, 
  DirectMessageDto, 
  ChatMessageDto, 
  CreateDirectConversationDto, 
  SendDirectMessageDto, 
  GetOrCreateDirectConversationDto,
  ConversationStatus,
  MessageType,
  MessageStatus,
  SenderType
} from '../../models/profile.models';
import { SignalRService } from './signalr.service';

@Injectable({
  providedIn: 'root'
})
export class MessagesService implements OnDestroy {
  private readonly apiUrl = `${environment.apiUrl}/api/directchat`;
  private destroy$ = new Subject<void>();
  
  // Observable for real-time messages
  private newMessageSubject = new BehaviorSubject<DirectMessageDto | null>(null);
  public newMessage$ = this.newMessageSubject.asObservable();
  
  // Observable for conversation updates
  private conversationUpdatedSubject = new BehaviorSubject<DirectConversationDto | null>(null);
  public conversationUpdated$ = this.conversationUpdatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private signalRService: SignalRService
  ) {
    this.setupSignalRListeners();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSignalRListeners() {
    // Listen for new messages from SignalR
    this.signalRService.newMessage$.pipe(takeUntil(this.destroy$)).subscribe(message => {
      if (message) {
        this.newMessageSubject.next(message);
      }
    });

    // Listen for conversation updates from SignalR
    this.signalRService.conversationUpdated$.pipe(takeUntil(this.destroy$)).subscribe(conversation => {
      if (conversation) {
        this.conversationUpdatedSubject.next(conversation);
      }
    });
  }

  // Get user conversations
  getConversations(page?: number, pageSize?: number): Observable<GeneralResponse<DirectConversationDto[]>> {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    return this.http.get<GeneralResponse<DirectConversationDto[]>>(`${this.apiUrl}/conversations`, { params });
  }

  // Get conversation by ID
  getConversation(conversationId: string): Observable<GeneralResponse<DirectConversationDto>> {
    return this.http.get<GeneralResponse<DirectConversationDto>>(`${this.apiUrl}/conversations/${conversationId}`);
  }

  // Create new conversation
  createConversation(dto: CreateDirectConversationDto): Observable<GeneralResponse<DirectConversationDto>> {
    return this.http.post<GeneralResponse<DirectConversationDto>>(`${this.apiUrl}/conversations`, dto);
  }

  // Get or create conversation
  getOrCreateConversation(dto: GetOrCreateDirectConversationDto): Observable<GeneralResponse<DirectConversationDto>> {
    return this.http.post<GeneralResponse<DirectConversationDto>>(`${this.apiUrl}/conversations/get-or-create`, dto);
  }

  // Send message
  sendMessage(conversationId: string, dto: SendDirectMessageDto): Observable<GeneralResponse<ChatMessageDto>> {
    return this.http.post<GeneralResponse<ChatMessageDto>>(`${this.apiUrl}/conversations/${conversationId}/messages`, dto);
  }

  // Get conversation messages
  getMessages(conversationId: string, page?: number, pageSize?: number): Observable<GeneralResponse<DirectMessageDto[]>> {
    const params: any = {};
    if (page) params.page = page;
    if (pageSize) params.pageSize = pageSize;
    return this.http.get<GeneralResponse<DirectMessageDto[]>>(`${this.apiUrl}/conversations/${conversationId}/messages`, { params });
  }

  // Mark message as read
  markAsRead(messageId: string): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(`${this.apiUrl}/messages/${messageId}/read`, {});
  }

  // Mark conversation as read
  markConversationAsRead(conversationId: string): Observable<GeneralResponse<boolean>> {
    return this.http.put<GeneralResponse<boolean>>(`${this.apiUrl}/conversations/${conversationId}/read`, {});
  }

  // SignalR Methods
  async joinConversation(conversationId: string): Promise<void> {
    await this.signalRService.joinConversation(conversationId);
  }

  async leaveConversation(conversationId: string): Promise<void> {
    await this.signalRService.leaveConversation(conversationId);
  }

  async sendMessageViaSignalR(conversationId: string, content: string): Promise<void> {
    await this.signalRService.sendMessage(conversationId, content);
  }

  async markMessageAsReadViaSignalR(messageId: string): Promise<void> {
    await this.signalRService.markMessageAsRead(messageId);
  }

  // Direct chat via SignalR group
  async joinConversationViaSignalR(conversationId: string): Promise<void> {
    await this.signalRService.joinDirectConversation(conversationId);
  }

  async leaveConversationViaSignalR(conversationId: string): Promise<void> {
    await this.signalRService.leaveDirectConversation(conversationId);
  }

  async sendDirectMessageViaSignalR(conversationId: string, content: string): Promise<void> {
    await this.signalRService.sendDirectMessage(conversationId, content);
  }

  async markDirectMessageAsReadViaSignalR(messageId: string): Promise<void> {
    await this.signalRService.markDirectMessageAsRead(messageId);
  }

  // Unread count
  getUnreadDirectMessageCount(): Observable<GeneralResponse<number>> {
    return this.http.get<GeneralResponse<number>>(`${this.apiUrl}/unread-count`);
  }

  async markDirectConversationAsReadViaSignalR(conversationId: string): Promise<void> {
    await this.signalRService.markDirectConversationAsRead(conversationId);
  }

  // Edit message
  editMessage(messageId: string, content: string): Observable<GeneralResponse<ChatMessageDto>> {
    return this.http.put<GeneralResponse<ChatMessageDto>>(`${this.apiUrl}/messages/${messageId}`, {
      content: content
    });
  }

  // Delete message
  deleteMessage(messageId: string): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.apiUrl}/messages/${messageId}`);
  }
}
