// ===== ADVERTISEMENTS MODELS =====

export type AdStatus = 'Draft' | 'Pending' | 'Published' | 'Rejected' | 'Archived';

export interface AdDto {
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
  
  // Contact Information - Direct fields for form handling
  contactNumber?: string;
  contactMethod?: 'Call' | 'WhatsApp';
  
  // Contact Information - Structured object
  contactInfo?: {
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    preferredContactMethod?: 'phone' | 'whatsapp' | 'email' | 'chat';
  };
  
  // AI Generated Content
  aiGeneratedTitle?: string;
  aiGeneratedDescription?: string;
  isAIGenerated: boolean;
  aiGeneratedAt?: Date;
  
  // A/B Testing
  abTestId?: string;
  abTestVariant?: string;
}

export interface CreateAdCommand {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId?: number;
  keywords?: string[];
  imageUrls?: string[];
  userId: string;
}

export interface CreateAdWithFilesCommand {
  title: string;
  description: string;
  price: number;
  location: string;
  categoryId?: number;
  keywords?: string[];
  images?: File[];
  userId: string;
  // Contact Information
  contactNumber: string;
  contactMethod: 'Call' | 'WhatsApp';
}

export interface GenerateAdContentCommand {
  productName: string;
  initialDescription: string;
  price: number;
  categoryId?: number;
  images?: File[];
  userId: string;
}

export interface CreateDraftAdCommand {
  productName: string;
  initialDescription: string;
  price: number;
  categoryId?: number;
  images?: File[];
  userId: string;
}

export interface AdPublishRequest {
  finalTitle: string;
  finalDescription: string;
  finalKeywords: string[];
  scheduledAtUtc?: Date;
}

export interface UpdateAdManagementCommand {
  adId: string;
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  categoryId?: number;
  keywords?: string[];
  newImages?: File[];
  imagesToDelete?: string[];
  userId: string;
}

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
  data: AdDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface AdGenerationResponse {
  generatedTitle: string;
  generatedDescription: string;
  generatedKeywords: string[];
  suggestions: string[];
  confidence: number;
  adId?: string;
}

export interface AdAnalysisResult {
  title: string;
  description: string;
  category: string;
  confidence: number;
  isSuccessful: boolean;
  errorMessage?: string;
  suggestions: string[];
}

export interface StartAdABTestRequest {
  adAId: string;
  adBId: string;
  endsAtUtc: Date;
}

export interface ABTestDto {
  id: string;
  adAId: string;
  adBId: string;
  status: 'Running' | 'Completed' | 'Cancelled';
  startDate: Date;
  endDate: Date;
  results?: ABTestResult;
}

export interface ABTestResult {
  winner: 'A' | 'B' | 'Tie';
  metrics: {
    viewsA: number;
    viewsB: number;
    clicksA: number;
    clicksB: number;
    conversionsA: number;
    conversionsB: number;
  };
  confidence: number;
}

export interface CommentDto {
  id: string;
  content: string;
  authorName: string;
  createdAt: Date;
  isEdited: boolean;
}

export interface AdminAdDto extends AdDto {
  userId: string;
  userEmail: string;
  rejectionReason?: string;
  adminNotes?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: Date;
}

export interface AdPerformanceDto {
  adId: string;
  title: string;
  status: AdStatus;
  createdAt: Date;
  publishedAt?: Date;
  totalViews: number;
  totalClicks: number;
  totalLikes: number;
  totalComments: number;
  clickThroughRate: number;
  conversionRate: number;
  revenue: number;
  rank: number;
  dailyStats: AdStatsDto[];
}

export interface AdStatsDto {
  adId: string;
  title: string;
  views: number;
  clicks: number;
  likes: number;
  comments: number;
  clickThroughRate: number;
  conversionRate: number;
  generatedAt: Date;
  period: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' | 'Yearly';
}

// Legacy aliases for backward compatibility
export type AdItem = AdDto;