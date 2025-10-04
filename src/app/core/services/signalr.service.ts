import { Injectable, OnDestroy } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NotificationDto } from '../../models/notification.model';
import { DirectMessageDto } from '../../models/chat.models';
import { TokenStorageService } from '../auth/token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SignalRService implements OnDestroy {
  private chatConnection?: HubConnection;
  private notificationConnection?: HubConnection;
  
  // Chat observables
  private newMessageSubject = new BehaviorSubject<DirectMessageDto | null>(null);
  public newMessage$ = this.newMessageSubject.asObservable();
  
  private conversationUpdatedSubject = new BehaviorSubject<any>(null);
  public conversationUpdated$ = this.conversationUpdatedSubject.asObservable();
  private directTypingSubject = new BehaviorSubject<{ conversationId: string; userId: string; isTyping: boolean } | null>(null);
  public directTyping$ = this.directTypingSubject.asObservable();
  
  // Notification observables
  private newNotificationSubject = new BehaviorSubject<NotificationDto | null>(null);
  public newNotification$ = this.newNotificationSubject.asObservable();
  
  private notificationUpdatedSubject = new BehaviorSubject<NotificationDto | null>(null);
  public notificationUpdated$ = this.notificationUpdatedSubject.asObservable();

  constructor(private tokenStorage: TokenStorageService) {
    this.initializeConnections();
  }

  ngOnDestroy() {
    this.stopConnections();
  }

  private initializeConnections() {
    this.startChatConnection();
    this.startNotificationConnection();
  }

  // Public wrappers used by header and other components
  public startConnection(): void {
    // If already connected, ignore; otherwise start/reconnect both
    if (this.chatConnection?.state !== HubConnectionState.Connected) {
      this.startChatConnection();
    }
    if (this.notificationConnection?.state !== HubConnectionState.Connected) {
      this.startNotificationConnection();
    }
  }

  public stopConnection(): void {
    this.stopConnections();
  }

  // Chat Connection
  private startChatConnection() {
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chatHub`, {
        accessTokenFactory: () => {
          const token = this.tokenStorage.accessToken;
          console.log('Using token for SignalR:', token ? 'Token present' : 'No token');
          return token || '';
        },
        skipNegotiation: false, // Allow negotiation
        transport: 1 // WebSockets only
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    this.chatConnection.start()
      .then(() => {
        console.log('Chat connection started');
        this.setupChatListeners();
      })
      .catch(error => {
        console.error('Error starting chat connection:', error);
        // Try with Server-Sent Events as fallback
        this.tryFallbackConnection();
      });
  }

  private tryFallbackConnection() {
    console.log('Trying fallback connection with Server-Sent Events...');
    this.chatConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chatHub`, {
        accessTokenFactory: () => {
          const token = this.tokenStorage.accessToken;
          console.log('Using token for fallback SignalR:', token ? 'Token present' : 'No token');
          return token || '';
        },
        skipNegotiation: false, // Allow negotiation
        transport: 2 // Server-Sent Events
      })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    this.chatConnection.start()
      .then(() => {
        console.log('Chat connection started with SSE fallback');
        this.setupChatListeners();
      })
      .catch(error => {
        console.error('Error starting fallback chat connection:', error);
      });
  }

  private setupChatListeners() {
    if (!this.chatConnection) return;

    // Listen for new messages
    this.chatConnection.on('ReceiveMessage', (message: DirectMessageDto) => {
      this.newMessageSubject.next(message);
    });

    // Listen for conversation updates
    this.chatConnection.on('ConversationUpdated', (conversation: any) => {
      this.conversationUpdatedSubject.next(conversation);
    });

    // Listen for message status updates
    this.chatConnection.on('MessageStatusUpdated', (messageId: string, status: string) => {
      // Handle message status update
      console.log(`Message ${messageId} status updated to ${status}`);
    });

    // ===== Direct Chat specific events =====
    this.chatConnection.on('ReceiveDirectMessage', (message: DirectMessageDto) => {
      this.newMessageSubject.next(message);
    });
    this.chatConnection.on('DirectConversationRead', (payload: any) => {
      // surface as conversation update so UI can zero unread and set ticks
      this.conversationUpdatedSubject.next(payload);
    });
    this.chatConnection.on('DirectMessageRead', (_messageId: string) => {
      // optionally handle read receipts
    });
    this.chatConnection.on('DirectTyping', (payload: { DirectConversationId: string; UserId: string; IsTyping: boolean; At: string; }) => {
      this.directTypingSubject.next({
        conversationId: payload.DirectConversationId,
        userId: payload.UserId,
        isTyping: payload.IsTyping
      });
    });
  }

  // Notification Connection
  private startNotificationConnection() {
    this.notificationConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/notificationHub`, {
        accessTokenFactory: () => {
          const token = this.tokenStorage.accessToken;
          console.log('Using token for notification SignalR:', token ? 'Token present' : 'No token');
          return token || '';
        },
        skipNegotiation: false
      })
      .withAutomaticReconnect()
      .build();

    this.notificationConnection.start()
      .then(() => {
        console.log('Notification connection started');
        this.setupNotificationListeners();
      })
      .catch(error => {
        console.error('Error starting notification connection:', error);
      });
  }

  private setupNotificationListeners() {
    if (!this.notificationConnection) return;

    // Listen for new notifications
    this.notificationConnection.on('ReceiveNotification', (notification: NotificationDto) => {
      this.newNotificationSubject.next(notification);
    });

    // Listen for notification updates
    this.notificationConnection.on('NotificationUpdated', (notification: NotificationDto) => {
      this.notificationUpdatedSubject.next(notification);
    });
  }

  // Chat Methods
  async joinConversation(conversationId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('JoinConversation', conversationId);
    }
  }

  async leaveConversation(conversationId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('LeaveConversation', conversationId);
    }
  }

  async sendMessage(conversationId: string, content: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('SendMessage', conversationId, content);
    }
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('MarkMessageAsRead', messageId);
    }
  }

  // ===== Direct Chat Methods =====
  async joinDirectConversation(directConversationId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('JoinDirectConversation', directConversationId);
    }
  }

  async leaveDirectConversation(directConversationId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('LeaveDirectConversation', directConversationId);
    }
  }

  async sendDirectMessage(directConversationId: string, content: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('SendDirectMessage', directConversationId, content);
    }
  }

  async markDirectMessageAsRead(messageId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('MarkDirectMessageAsRead', messageId);
    }
  }

  async sendDirectTyping(directConversationId: string, isTyping: boolean): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      try {
        await this.chatConnection.invoke('DirectTyping', directConversationId, isTyping);
      } catch (error) {
        console.warn('Failed to send typing status:', error);
        // Don't throw error to prevent UI issues
      }
    } else {
      console.warn('Chat connection not available for typing status');
    }
  }

  async markDirectConversationAsRead(directConversationId: string): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Connected) {
      await this.chatConnection.invoke('MarkDirectConversationAsRead', directConversationId);
    }
  }

  // Notification Methods
  async joinUserGroup(userId: string): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Connected) {
      await this.notificationConnection.invoke('JoinUserGroup', userId);
    }
  }

  async leaveUserGroup(userId: string): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Connected) {
      await this.notificationConnection.invoke('LeaveUserGroup', userId);
    }
  }

  // Connection Management
  async reconnectChat(): Promise<void> {
    if (this.chatConnection?.state === HubConnectionState.Disconnected) {
      await this.chatConnection.start();
    }
  }

  async reconnectNotifications(): Promise<void> {
    if (this.notificationConnection?.state === HubConnectionState.Disconnected) {
      await this.notificationConnection.start();
    }
  }

  private stopConnections() {
    if (this.chatConnection) {
      this.chatConnection.stop();
    }
    if (this.notificationConnection) {
      this.notificationConnection.stop();
    }
  }

  // Connection Status
  get isChatConnected(): boolean {
    return this.chatConnection?.state === HubConnectionState.Connected;
  }

  get isNotificationConnected(): boolean {
    return this.notificationConnection?.state === HubConnectionState.Connected;
  }

  get chatConnectionState(): HubConnectionState | undefined {
    return this.chatConnection?.state;
  }

  get notificationConnectionState(): HubConnectionState | undefined {
    return this.notificationConnection?.state;
  }
}