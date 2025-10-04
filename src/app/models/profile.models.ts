// ===== PROFILE MODELS =====
// Based on actual Backend DTOs

import { ActivityDto } from './admin.models';

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

// Note: UserDashboardDto is now in auth.models.ts

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
// Note: AdDto and related models are now in ads.models.ts

// ===== MESSAGING MODELS =====
// Note: ConversationStatus and DirectConversationDto are now in chat.models.ts

// Note: DirectMessageDto, MessageType, and MessageStatus are now in chat.models.ts

// Note: ChatMessageDto and related models are now in chat.models.ts

// ===== NOTIFICATION MODELS =====
// Note: NotificationDto and related models are now in notification.model.ts

export interface NotificationFilters {
  type?: string;
  isRead?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// ===== SUBSCRIPTION MODELS =====
// Note: SubscriptionDto and related models are now in payments.models.ts

// Note: PaymentRequestDto and PaymentResponseDto are now in payments.models.ts

// ===== DASHBOARD MODELS =====
// Note: UserDashboardDto and ActivityDto are now in auth.models.ts and admin.models.ts respectively

export interface PerformanceMetricsDto {
  viewsGrowth: number;
  clicksGrowth: number;
  likesGrowth: number;
  revenueGrowth: number;
  responseTime: number;
  conversionRate: number;
}

export interface NotificationSummaryDto {
  unreadCount: number;
  recentNotifications: number;
  priorityAlerts: number;
}

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

// Note: ActivityDto is now in admin.models.ts

// ===== COMMON MODELS =====
// Note: PaginatedResponse, SelectOption, and FilterOption are now in common.models.ts

// ===== ADDITIONAL MODELS FROM ADS COMPONENT =====
// Note: AdSearchRequest, PaginatedAdsResponse, and AdItem are now in ads.models.ts

// ===== CATEGORY MODELS =====
// Note: CategoryDto is now in categories.models.ts

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

// Note: GeneralResponse is now in common.models.ts

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