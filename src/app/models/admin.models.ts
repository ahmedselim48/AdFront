// ===== ADMIN MODELS =====

export interface PaginatedUsersResponse {
  data: UserDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface UserDto {
  id: string;
  email: string;
  userName: string;
  fullName: string;
  roles: string[];
  emailConfirmed: boolean;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: Date;
  lastLoginAt?: Date;
  isBlocked: boolean;
  blockedUntil?: Date;
  blockedReason?: string;
}

export interface BlockUserRequestDto {
  userId: string;
  durationDays: number;
  reason?: string;
}

export interface AdminStatisticsDto {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  totalAds: number;
  publishedAds: number;
  pendingAds: number;
  rejectedAds: number;
  totalCategories: number;
  totalRevenue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  topCategories: CategoryStatsDto[];
  recentActivity: ActivityDto[];
}

export interface CategoryStatsDto {
  categoryId: number;
  categoryName: string;
  adCount: number;
  viewCount: number;
  clickCount: number;
  averagePrice: number;
}

export interface ActivityDto {
  id: string;
  type: 'UserRegistration' | 'AdCreated' | 'AdPublished' | 'AdRejected' | 'UserBlocked' | 'UserUnblocked' | 'ad_published' | 'message_received' | 'view_increase';
  title?: string; // Add title for backward compatibility
  description: string;
  timestamp?: Date; // Add timestamp for backward compatibility
  userId?: string;
  userName?: string;
  adId?: string;
  adTitle?: string;
  createdAt: Date;
  data?: any; // Add data property for additional activity data
}

export interface AdminReportDto {
  period: 'Weekly' | 'Monthly';
  startDate: Date;
  endDate: Date;
  generatedAt: Date;
  summary: {
    totalUsers: number;
    newUsers: number;
    totalAds: number;
    newAds: number;
    totalRevenue: number;
    newRevenue: number;
  };
  userGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
  adGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
  revenueGrowth: {
    current: number;
    previous: number;
    percentage: number;
  };
  topPerformingCategories: CategoryStatsDto[];
  userActivity: {
    dailyActiveUsers: number[];
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
  };
  adPerformance: {
    averageViews: number;
    averageClicks: number;
    averageLikes: number;
    conversionRate: number;
  };
}
