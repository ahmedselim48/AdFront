// ===== PROFILE MODELS =====
// Based on actual Backend DTOs

export interface ProfileDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  roles: string[];
}

export interface ProfileUpdateDto {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  address?: string;
}

export interface UserDashboardDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  profileImageUrl?: string;
  isEmailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
  roles: string[];
  totalAds?: number;
  activeAds?: number;
  totalViews?: number;
  totalClicks?: number;
  totalLikes?: number;
  totalMessages?: number;
  unreadMessages?: number;
  subscriptionStatus?: SubscriptionStatusDto;
}

export interface SubscriptionStatusDto {
  hasActive: boolean;
  daysRemaining?: number;
  endDate?: string;
  plan?: string;
  planName?: string;
  amount?: number;
  currency?: string;
}

// ===== ADS MODELS =====

export interface AdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  categoryId: string;
  categoryName: string;
  userId: string;
  userName: string;
  status: AdStatus;
  views: number;
  clicks: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  expiresAt?: string;
  images: AdImageDto[];
  location?: string;
  contactInfo?: string;
  tags: string[];
}

export interface AdImageDto {
  id: string;
  imageUrl: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  order: number;
}

export enum AdStatus {
  Draft = 'Draft',
  Pending = 'Pending',
  Published = 'Published',
  Rejected = 'Rejected',
  Expired = 'Expired',
  Deleted = 'Deleted'
}

export interface CreateAdDto {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  location?: string;
  contactInfo?: string;
  tags: string[];
}

export interface UpdateAdDto {
  title?: string;
  description?: string;
  price?: number;
  categoryId?: string;
  location?: string;
  contactInfo?: string;
  tags?: string[];
}

export interface AdFilters {
  status?: AdStatus;
  categoryId?: string;
  searchTerm?: string;
  keyword?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  dateFrom?: string;
  dateTo?: string;
}

// ===== MESSAGING MODELS =====

export interface DirectConversationDto {
  id: string;
  user1Id: string;
  user1Name: string;
  user2Id: string;
  user2Name: string;
  createdAt: string;
  lastMessageAt?: string;
  status: ConversationStatus;
  isActive: boolean;
  lastMessage?: DirectMessageDto;
  unreadMessageCount: number;
}

export interface DirectMessageDto {
  id: string;
  directConversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
  messageType: MessageType;
  isRead: boolean;
  isAutoReply: boolean;
  status: MessageStatus;
}

export interface ChatMessageDto {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
  messageType: MessageType;
  senderType: SenderType;
  isRead: boolean;
  isAutoReply: boolean;
  replyTemplateId?: string;
  status: MessageStatus;
}

export interface CreateDirectConversationDto {
  otherUserId: string;
  initialMessage: string;
}

export interface SendDirectMessageDto {
  directConversationId: string;
  content: string;
  replyToMessageId?: string;
}

export interface GetOrCreateDirectConversationDto {
  otherUserId: string;
}

export enum ConversationStatus {
  Active = 'Active',
  Closed = 'Closed',
  Blocked = 'Blocked'
}

export enum MessageType {
  Text = 'Text',
  Image = 'Image',
  File = 'File',
  System = 'System'
}

export enum MessageStatus {
  Sent = 'Sent',
  Delivered = 'Delivered',
  Read = 'Read',
  Failed = 'Failed'
}

export enum SenderType {
  User = 'User',
  System = 'System',
  Bot = 'Bot'
}

// ===== NOTIFICATION MODELS =====

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data?: string;
}

export interface NotificationSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  adUpdates: boolean;
  chatMessages: boolean;
  systemUpdates: boolean;
  performanceAlerts: boolean;
  competitionReports: boolean;
  securityAlerts: boolean;
}

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ===== SUBSCRIPTION MODELS =====

export interface SubscriptionDto {
  userId: string;
  isActive: boolean;
  endDate: Date | string;
  provider: string;
  amount: number;
  daysLeft: number;
}

export interface CheckoutSessionDto {
  sessionId: string;
  url: string;
  amount: number;
  currency: string;
  provider: string;
}

export interface CreateSubscriptionRequestDto {
  provider: string;
}

export interface ConfirmSubscriptionRequestDto {
  sessionId: string;
}

export interface PaymentRequestDto {
  provider: string;
  amount: number;
}

export interface PaymentResponseDto {
  success: boolean;
  transactionId: string;
  provider: string;
  expiryDate: string;
}

// ===== DASHBOARD MODELS =====

export interface DashboardStatsDto {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalClicks: number;
  totalLikes: number;
  totalMessages: number;
  unreadMessages: number;
  conversionRate: number;
  averagePrice: number;
  topCategory: string;
  recentActivity: ActivityDto[];
}

export interface ActivityDto {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  data?: any;
}

// ===== COMMON MODELS =====

export interface PaginatedResponse<T> {
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'boolean';
  options?: SelectOption[];
  placeholder?: string;
}

// ===== ADDITIONAL MODELS FROM ADS COMPONENT =====

export interface AdSearchRequest {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: AdStatus;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'date' | 'views' | 'likes';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedAdsResponse {
  data: AdItem[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface AdItem {
  id: string;
  title: string;
  description?: string;
  price: number;
  location?: string;
  categoryId?: number;
  categoryName?: string;
  createdAt: Date;
  viewsCount: number;
  clicksCount: number;
  likesCount: number;
  commentsCount: number;
  status: AdStatus;
  scheduledAtUtc?: Date;
  publishedAtUtc?: Date;
  userId: string;
  userName?: string;
  userImageUrl?: string;
  images?: string[];
  keywords?: string[];
  
  // Contact Information
  contactNumber?: string;
  contactMethod?: 'Call' | 'WhatsApp';
  
  // AI Generated Content
  aiGeneratedTitle?: string;
  aiGeneratedDescription?: string;
  isAIGenerated?: boolean;
  aiGeneratedAt?: Date;
}

// ===== CATEGORY MODELS =====

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ===== FILE VALIDATION MODELS =====

export interface FileValidationResult {
  validFiles: File[];
  skippedFiles: SkippedFile[];
  hasErrors: boolean;
  totalSize: number;
  validCount: number;
  skippedCount: number;
}

export interface SkippedFile {
  fileName: string;
  reason: string;
  details: string;
  suggestedAction?: string;
}

// ===== CONTACT HELPER MODELS =====

export interface ContactInfo {
  phoneNumber?: string;
  whatsappNumber?: string;
  email?: string;
  preferredContactMethod?: 'phone' | 'whatsapp' | 'email' | 'chat';
}

// ===== API RESPONSE MODELS =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
  statusCode?: number;
}

export interface GeneralResponse<T> {
  success: boolean;
  data: T;
  message: string;
  errors: string[];
}

// ===== FORM MODELS =====

export interface FormValidationError {
  field: string;
  message: string;
  code: string;
}

export interface FormState {
  isValid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  errors: FormValidationError[];
}