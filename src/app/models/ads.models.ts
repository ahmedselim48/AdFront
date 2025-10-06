// ===== ADVERTISEMENTS MODELS =====


export type AdStatus = 'Draft' | 'Pending' | 'Active' | 'Published' | 'Rejected' | 'Archived' | 'Scheduled';

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
  views: number;
  clicksCount: number;
  likesCount: number;
  likes: number;
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
  searchTerm?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: AdStatus;
  userId?: string;
  createdFrom?: Date;
  createdTo?: Date;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  pageSize?: number;
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
  testName?: string;
  description?: string;
}

export interface ABTestDto {
  testId: string;
  adAId: string;
  adBId: string;
  adATitle: string;
  adBTitle: string;
  testName: string;
  description?: string;
  startedAtUtc: Date;
  endsAtUtc?: Date;
  isActive: boolean;
  adAViews: number;
  adAClicks: number;
  adBViews: number;
  adBClicks: number;
  adAClickRate: number;
  adBClickRate: number;
  winnerAdId?: string;
  testStatus: string;
}

export interface ABTestResult {
  testId: string;
  adAId: string;
  adBId: string;
  testName?: string;
  description?: string;
  viewsA: number;
  clicksA: number;
  viewsB: number;
  clicksB: number;
  winnerAdId?: string;
  ctrA: number;
  ctrB: number;
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

// Additional interfaces
export interface AdImageDto {
  id: string;
  adId: string;
  imageUrl: string;
  isPrimary: boolean;
  order: number;
  createdAt: Date;
}

export interface CreateAdDto {
  title: string;
  description?: string;
  price: number;
  location?: string;
  categoryId?: number;
  contactNumber?: string;
  contactMethod?: 'Call' | 'WhatsApp';
  contactInfo?: {
    phoneNumber?: string;
    whatsappNumber?: string;
    email?: string;
    preferredContactMethod?: 'phone' | 'whatsapp' | 'email' | 'chat';
  };
  tags?: string[]; // Add tags for backward compatibility
  images?: string[];
  keywords?: string[];
  scheduledAtUtc?: Date;
}

export interface UpdateAdDto {
  id: string;
  title?: string;
  description?: string;
  price?: number;
  location?: string;
  categoryId?: number;
  contactNumber?: string;
  contactMethod?: 'Call' | 'WhatsApp';
  images?: string[];
  keywords?: string[];
  scheduledAtUtc?: Date;
}

export interface AdFilters {
  searchTerm?: string;
  keyword?: string; // Add keyword for backward compatibility
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  status?: AdStatus;
  userId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'price' | 'views' | 'clicks' | 'likes';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

// Legacy aliases for backward compatibility
export type AdItem = AdDto;