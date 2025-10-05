import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  createdAt: string;
  averageCompetitorPrice: number;
  competitorCount: number;
  priceDifferencePercentage: number;
  averageImageCount: number;
  averageDescriptionLength: number;
  commonKeywords: string;
  priceSuggestion: string;
  descriptionSuggestion: string;
  imageSuggestion: string;
  generalSuggestion: string;
  category?: string;
  subCategory?: string;
  userAdViews: number;
  userAdMessages: number;
  userAdCTR: number;
  userAdEngagementRate: number;
  userAdLikes: number;
  userAdComments: number;
  userAdLikeRate: number;
  userAdCommentRate: number;
  averageCompetitorLikes: number;
  averageCompetitorComments: number;
  averageCompetitorEngagementRate: number;
  averageCompetitorLikeRate: number;
  averageCompetitorCommentRate: number;
  categoryAdCount: number;
  categoryAveragePrice: number;
  categoryAverageEngagement: number;
  categoryTopKeywords?: string;
  userAdCommentSentiment?: string;
  competitorCommentSentiment?: string;
  sentimentInsights?: string;
  engagementSuggestion?: string;
  contentOptimizationSuggestion?: string;
  interactionImprovementSuggestion?: string;
  marketPosition: number;
  competitiveAdvantage: number;
  improvementPotential: number;
  marketTrends?: string;
  successFactors?: string;
  riskFactors?: string;
  maxCompetitorsAnalyzed: number;
  analysisDepth: number;
  includeHistoricalData: boolean;
  includeTrendAnalysis: boolean;
  status: string;
  startedAt?: string;
  completedAt?: string;
  processingTimeSeconds: number;
  errorMessage?: string;
  competitorAds: CompetitorAdDto[];
}

export interface CompetitorAdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location?: string;
  sourceUrl?: string;
  collectedAt: string;
}

export interface CompetitionSuggestionsDto {
  analysisId: string;
  adId: string;
  priceSuggestions: string[];
  contentSuggestions: string[];
  imageSuggestions: string[];
  engagementSuggestions: string[];
  marketInsights: string[];
  actionItems: ActionItem[];
  priority: string;
  estimatedImpact: string;
  generatedAt: string;
}

export interface ActionItem {
  category: string;
  title: string;
  priority: string;
  estimatedImpact: string;
  description?: string;
}

export interface CompetitionDashboardDto {
  analysisId: string;
  adId: string;
  adTitle: string;
  lastUpdated: string;
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
  title: string;
  description: string;
  icon: string;
  color: string;
}

export interface MarketInsights {
  category: string;
  location: string;
  generatedAt: string;
  overview: {
    totalAds: number;
    averagePrice: number;
    marketActivity: string;
  };
  priceRange?: {
    minPrice: number;
    maxPrice: number;
  };
  recommendations: string[];
}

export interface GeneralResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private readonly apiUrl = `${environment.apiUrl}/api/competition`;

  constructor(private http: HttpClient) {}

  /**
   * Analyze competition for a specific ad
   */
  analyzeCompetition(request: CompetitionAnalysisRequest): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.http.post<GeneralResponse<CompetitionAnalysisDto>>(`${this.apiUrl}/analyze`, request);
  }

  /**
   * Get competition analysis by ID
   */
  getAnalysisById(id: string): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.http.get<GeneralResponse<CompetitionAnalysisDto>>(`${this.apiUrl}/${id}`);
  }

  /**
   * Get competition analysis by ad ID
   */
  getAnalysisByAdId(adId: string): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.http.get<GeneralResponse<CompetitionAnalysisDto>>(`${this.apiUrl}/ad/${adId}`);
  }

  /**
   * Get all competition analyses for the current user
   */
  getUserAnalyses(page: number = 1, pageSize: number = 10): Observable<GeneralResponse<CompetitionAnalysisDto[]>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    return this.http.get<GeneralResponse<CompetitionAnalysisDto[]>>(`${this.apiUrl}/user`, { params });
  }

  /**
   * Get competition dashboard with enhanced insights
   */
  getCompetitionDashboard(adId: string): Observable<GeneralResponse<CompetitionDashboardDto>> {
    return this.http.get<GeneralResponse<CompetitionDashboardDto>>(`${this.apiUrl}/dashboard/${adId}`);
  }

  /**
   * Get market insights and trends
   */
  getMarketInsights(category?: string, location?: string): Observable<GeneralResponse<MarketInsights>> {
    let params = new HttpParams();
    if (category) params = params.set('category', category);
    if (location) params = params.set('location', location);
    
    return this.http.get<GeneralResponse<MarketInsights>>(`${this.apiUrl}/insights`, { params });
  }

  /**
   * Get comprehensive suggestions for improving ad performance
   */
  getCompetitionSuggestions(analysisId: string): Observable<GeneralResponse<CompetitionSuggestionsDto>> {
    return this.http.get<GeneralResponse<CompetitionSuggestionsDto>>(`${this.apiUrl}/suggestions/${analysisId}`);
  }

  /**
   * Generate AI-powered suggestions for ad optimization
   */
  generateAISuggestions(adId: string): Observable<GeneralResponse<CompetitionSuggestionsDto>> {
    return this.http.post<GeneralResponse<CompetitionSuggestionsDto>>(`${this.apiUrl}/ai-suggestions/${adId}`, {});
  }
}