export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

export interface AppNotification {
  id: string;
  level: NotificationLevel;
  message: string;
  createdAt: string;
  read: boolean;
}
