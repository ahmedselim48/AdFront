// ===== NOTIFICATIONS MODELS =====

export type NotificationType = 
  | 'AdPublished'
  | 'AdExpired'
  | 'ABTesting'
  | 'NewMessage'
  | 'ContactRequest'
  | 'CheaperCompetitor'
  | 'CompetitionReport'
  | 'SuspiciousLogin'
  | 'Payment'
  | 'SubscriptionExpiring'
  | 'WeeklySummary';

export interface NotificationDto {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  data?: any;
}

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

// Legacy aliases for backward compatibility
export type AppNotification = NotificationDto;