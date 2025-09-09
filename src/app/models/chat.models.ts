export interface Conversation {
  id: string;
  title?: string;
  createdAt: string;
  updatedAt?: string;
  isClosed?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId?: string;
  content: string;
  createdAt: string;
  isRead?: boolean;
}

export interface ReplyTemplate {
  id: string;
  title: string;
  body: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UnreadCount {
  count: number;
}
