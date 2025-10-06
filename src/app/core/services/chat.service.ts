import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ConversationDto,
  DirectConversationDto,
  ChatMessageDto,
  CreateConversationDto,
  CreateDirectConversationDto,
  GetOrCreateDirectConversationDto,
  SendMessageDto,
  SendDirectMessageDto,
  ReplyRequestCommand,
  ReplyResultDto,
  StartConversationCommand,
  PostSellerReplyCommand,
  TemplateDto,
  CreateTemplateCommand,
  SubmitFeedbackCommand,
  ReplyAnalyticsDto,
  PagedResult,
  ConversationRole,
  ConversationStatus,
  TemplateType,
  IntentType
} from '../../models/chat.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private api = inject(ApiClientService);
  private baseUrl = environment.apiBaseUrl;

  // Smart Replies
  generateReply(request: ReplyRequestCommand): Observable<ReplyResultDto> {
    return this.api.post$<ReplyResultDto>(`${this.baseUrl}/smartreplies/reply`, request);
  }

  startConversation(request: StartConversationCommand): Observable<ConversationDto> {
    return this.api.post$<ConversationDto>(`${this.baseUrl}/smartreplies/conversations/start`, request);
  }

  getConversations(
    role: ConversationRole = 'Buyer',
    status?: ConversationStatus,
    pageNumber = 1,
    pageSize = 20
  ): Observable<PagedResult<ConversationDto>> {
    const params = new URLSearchParams();
    params.set('role', role);
    if (status) params.set('status', status);
    params.set('pageNumber', String(pageNumber));
    params.set('pageSize', String(pageSize));

    return this.api.get$<PagedResult<ConversationDto>>(`${this.baseUrl}/smartreplies/conversations?${params.toString()}`);
  }

  getConversationMessages(
    conversationId: string,
    limit?: number,
    beforeDate?: Date
  ): Observable<ChatMessageDto[]> {
    const params = new URLSearchParams();
    if (limit) params.set('limit', String(limit));
    if (beforeDate) params.set('beforeDate', beforeDate.toISOString());

    return this.api.get$<ChatMessageDto[]>(`${this.baseUrl}/smartreplies/conversations/${conversationId}/messages?${params.toString()}`);
  }

  postSellerReply(conversationId: string, request: PostSellerReplyCommand): Observable<ChatMessageDto> {
    return this.api.post$<ChatMessageDto>(`${this.baseUrl}/smartreplies/conversations/${conversationId}/reply`, request);
  }

  // Templates
  getTemplates(
    adId?: string,
    type?: TemplateType,
    intent?: IntentType,
    isActive?: boolean
  ): Observable<TemplateDto[]> {
    const params = new URLSearchParams();
    if (adId) params.set('adId', adId);
    if (type) params.set('type', type);
    if (intent) params.set('intent', intent);
    if (isActive !== undefined) params.set('isActive', String(isActive));

    return this.api.get$<TemplateDto[]>(`${this.baseUrl.replace('/api', '')}/smartreplies/templates?${params.toString()}`);
  }

  createTemplate(request: CreateTemplateCommand): Observable<TemplateDto> {
    return this.api.post$<TemplateDto>(`${this.baseUrl.replace('/api', '')}/smartreplies/templates`, request);
  }

  submitFeedback(request: SubmitFeedbackCommand): Observable<boolean> {
    return this.api.post$<boolean>(`${this.baseUrl.replace('/api', '')}/smartreplies/feedback`, request);
  }

  getRepliesAnalytics(
    adId?: string,
    templateId?: string,
    fromDate?: Date,
    toDate?: Date
  ): Observable<ReplyAnalyticsDto> {
    const params = new URLSearchParams();
    if (adId) params.set('adId', adId);
    if (templateId) params.set('templateId', templateId);
    if (fromDate) params.set('fromDate', fromDate.toISOString());
    if (toDate) params.set('toDate', toDate.toISOString());

    return this.api.get$<ReplyAnalyticsDto>(`${this.baseUrl.replace('/api', '')}/smartreplies/analytics/replies?${params.toString()}`);
  }

  // Direct Chat
  createDirectConversation(dto: CreateDirectConversationDto): Observable<GeneralResponse<DirectConversationDto>> {
    return this.api.post$<GeneralResponse<DirectConversationDto>>(`${this.baseUrl}/directchat/conversations`, dto);
  }

  getOrCreateDirectConversation(dto: GetOrCreateDirectConversationDto): Observable<GeneralResponse<DirectConversationDto>> {
    return this.api.post$<GeneralResponse<DirectConversationDto>>(`${this.baseUrl}/directchat/conversations/get-or-create`, dto);
  }

  getUserDirectConversations(): Observable<GeneralResponse<DirectConversationDto[]>> {
    return this.api.get$<GeneralResponse<DirectConversationDto[]>>(`${this.baseUrl}/directchat/conversations`);
  }

  getDirectConversation(conversationId: string): Observable<GeneralResponse<DirectConversationDto>> {
    return this.api.get$<GeneralResponse<DirectConversationDto>>(`${this.baseUrl}/directchat/conversations/${conversationId}`);
  }

  sendDirectMessage(conversationId: string, dto: SendDirectMessageDto): Observable<GeneralResponse<ChatMessageDto>> {
    return this.api.post$<GeneralResponse<ChatMessageDto>>(`${this.baseUrl}/directchat/conversations/${conversationId}/messages`, dto);
  }

  getDirectConversationMessages(
    conversationId: string,
    page = 1,
    pageSize = 50
  ): Observable<GeneralResponse<ChatMessageDto[]>> {
    return this.api.get$<GeneralResponse<ChatMessageDto[]>>(`${this.baseUrl}/directchat/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`);
  }

  markDirectMessageAsRead(messageId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/directchat/messages/${messageId}/read`, {});
  }

  markDirectConversationAsRead(conversationId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/directchat/conversations/${conversationId}/read`, {});
  }

  closeDirectConversation(conversationId: string): Observable<GeneralResponse<boolean>> {
    return this.api.put$<GeneralResponse<boolean>>(`${this.baseUrl}/directchat/conversations/${conversationId}/close`, {});
  }

  getUnreadDirectMessageCount(): Observable<GeneralResponse<number>> {
    return this.api.get$<GeneralResponse<number>>(`${this.baseUrl}/directchat/unread-count`);
  }
}