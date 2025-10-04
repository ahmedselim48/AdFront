// ===== NOTIFICATIONS MODELS =====

export type NotificationType = 
  | 'AdPublished'
  | 'AdPublishFailed'
  | 'AdExpired'
  | 'AdStatusChanged'
  | 'CompetitionAnalysis'
  | 'CompetitionReport'
  | 'NewCompetitor'
  | 'CheaperCompetitor'
  | 'PerformanceAlert'
  | 'PerformanceImprovement'
  | 'WeeklySummary'
  | 'DailyReport'
  | 'ABTesting'
  | 'MarketInsights'
  | 'SmartRecommendation'
  | 'TrendingCategory'
  | 'NewMessage'
  | 'ContactRequest'
  | 'MessageReaction'
  | 'Security'
  | 'AccountSecurity'
  | 'PasswordChanged'
  | 'EmailVerification'
  | 'Payment'
  | 'SubscriptionExpiring'
  | 'SubscriptionRenewed'
  | 'SubscriptionCancelled'
  | 'SystemMaintenance'
  | 'SystemUpdate'
  | 'FeatureAnnouncement'
  | 'General'
  | 'Broadcast'
  | 'Group'
  | 'Urgent'
  | 'HighPriority';

export type NotificationPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type NotificationCategory = 'Ad' | 'Chat' | 'System' | 'Security' | 'Payment' | 'Analysis' | 'Performance' | 'Competition' | 'Insights' | 'Recommendation' | 'Trends' | 'Contact' | 'Subscription' | 'General' | 'Group';
export type NotificationStatus = 'Unread' | 'Read' | 'Archived';
export type NotificationActionType = 'View' | 'Edit' | 'Delete' | 'Renew' | 'Retry' | 'OpenChat';

export interface NotificationDto {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  subCategory?: string;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
  expiresAt?: Date;
  actionUrl?: string;
  actionText?: string;
  actionType?: NotificationActionType;
  clickCount: number;
  isArchived: boolean;
  status: NotificationStatus;
  data?: Record<string, unknown>;
}

export interface CreateNotificationDto {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority?: NotificationPriority;
  category?: NotificationCategory;
  subCategory?: string;
  expiresAt?: Date;
  scheduledFor?: Date;
  actionUrl?: string;
  actionText?: string;
  actionType?: NotificationActionType;
  data?: Record<string, unknown>;
}

export interface NotificationFilterDto {
  type?: NotificationType;
  category?: NotificationCategory;
  priority?: NotificationPriority;
  isRead?: boolean;
  fromDate?: Date;
  toDate?: Date;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface NotificationListResponseDto {
  notifications: NotificationDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationBadgeDto {
  unreadCount: number;
  urgentCount: number;
  highPriorityCount: number;
  latestNotifications: NotificationDto[];
}

export interface NotificationStatsDto {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  byCategory: Record<string, number>;
}

export interface NotificationSettingsDto {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  emailAdUpdates: boolean;
  emailChatMessages: boolean;
  emailSystemAlerts: boolean;
  emailSecurityAlerts: boolean;
  emailPerformanceAlerts: boolean;
  emailMarketingEmails: boolean;
  pushAdUpdates: boolean;
  pushChatMessages: boolean;
  pushSystemAlerts: boolean;
  pushSecurityAlerts: boolean;
  pushPerformanceAlerts: boolean;
  smsSecurityAlerts: boolean;
  smsPaymentAlerts: boolean;
  enableQuietHours: boolean;
  quietHoursStart: string;
  quietHoursEnd: string;
  timeZone: string;
  emailFrequency: string;
  pushFrequency: string;
  receiveLowPriority: boolean;
  receiveMediumPriority: boolean;
  receiveHighPriority: boolean;
  receiveUrgentPriority: boolean;
}

export interface BulkNotificationActionDto {
  notificationIds: string[];
  action: 'mark-read' | 'delete' | 'archive';
}

export interface NotificationActionDto {
  action: 'read' | 'click' | 'action' | 'view';
  timestamp?: Date;
  actionData?: string;
}

export interface RealTimeNotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  createdAt: Date;
  actionUrl?: string;
  actionText?: string;
  actionType?: NotificationActionType;
  data?: Record<string, unknown>;
}

// Legacy aliases for backward compatibility
export type AppNotification = NotificationDto;
export interface NotificationRequest {
  page?: number;
  pageSize?: number;
  type?: NotificationType;
  isRead?: boolean;
}
export interface MarkAsReadRequest {
  notificationId: string;
}
export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<NotificationType, number>;
}
