// ===== COMPETITION MODELS =====

export interface CompetitionAnalysisRequest {
  adId: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  maxCompetitors?: number;
}

export interface CompetitionAnalysisDto {
  id: string;
  adId: string;
  userId: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  competitorCount: number;
  averagePrice: number;
  medianPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketPosition: number;
  contentScore: number;
  recommendations: string[];
  competitors: CompetitorAdDto[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorAdDto {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  images: string[];
  viewsCount: number;
  likesCount: number;
  publishedAt: Date;
  platform: string;
  url?: string;
}

export interface CompetitionSuggestionsDto {
  analysisId: string;
  priceSuggestions: string[];
  contentSuggestions: string[];
  imageSuggestions: string[];
  marketingSuggestions: string[];
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: string;
}

export interface CompetitionDashboardDto {
  analysisId: string;
  adId: string;
  adTitle: string;
  lastUpdated: Date;
  marketPosition: number;
  marketPositionText: string;
  marketPositionColor: string;
  userPrice: number;
  marketAverage: number;
  priceDifference: number;
  priceStatus: string;
  priceStatusText: string;
  priceStatusColor: string;
  contentScore: number;
  contentScoreText: string;
  contentScoreColor: string;
  competitorCount: number;
  competitorCountText: string;
  quickInsights: QuickInsight[];
  actionItems: ActionItem[];
}

export interface QuickInsight {
  type: string;
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface ActionItem {
  category: string;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  estimatedImpact: string;
}

export interface MarketInsights {
  category?: string;
  location?: string;
  generatedAt: Date;
  overview: {
    totalAds: number;
    averagePrice: number;
    marketActivity: string;
  };
  recommendations: string[];
}
