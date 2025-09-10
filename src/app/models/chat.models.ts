export interface Conversation {
  id: string;
  adId: string;
  adTitle: string;
  adPrice: number;
  adImageUrl: string;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  createdAt: string;
  lastMessageAt?: string;
  status: string;
  isActive: boolean;
  lastMessage?: Message;
  unreadMessageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
  messageType: string;
  isRead: boolean;
  isAutoReply: boolean;
  status: string;
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

// Direct Chat Models
export interface DirectConversation {
  id: string;
  user1Id: string;
  user1Name: string;
  user2Id: string;
  user2Name: string;
  createdAt: string;
  lastMessageAt?: string;
  isActive: boolean;
  lastMessage?: DirectMessage;
  unreadMessageCount: number;
}

export interface DirectMessage {
  id: string;
  directConversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  sentAt: string;
  readAt?: string;
  messageType: string;
  isRead: boolean;
  status: string;
}
