import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CompetitionAnalysisRequest,
  CompetitionAnalysisDto,
  CompetitionSuggestionsDto,
  CompetitionDashboardDto,
  MarketInsights
} from '../../models/competition.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  private api = inject(ApiClientService);
  private baseUrl = environment.apiBaseUrl;

  analyzeCompetition(request: CompetitionAnalysisRequest): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.api.post$<GeneralResponse<CompetitionAnalysisDto>>(`${this.baseUrl}/competition/analyze`, request);
  }

  getAnalysisById(analysisId: string): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.api.get$<GeneralResponse<CompetitionAnalysisDto>>(`${this.baseUrl}/competition/${analysisId}`);
  }

  getAnalysisByAdId(adId: string): Observable<GeneralResponse<CompetitionAnalysisDto>> {
    return this.api.get$<GeneralResponse<CompetitionAnalysisDto>>(`${this.baseUrl}/competition/ad/${adId}`);
  }

  getUserAnalyses(page = 1, pageSize = 10): Observable<GeneralResponse<CompetitionAnalysisDto[]>> {
    return this.api.get$<GeneralResponse<CompetitionAnalysisDto[]>>(`${this.baseUrl}/competition/user?page=${page}&pageSize=${pageSize}`);
  }

  getCompetitionDashboard(adId: string): Observable<GeneralResponse<CompetitionDashboardDto>> {
    return this.api.get$<GeneralResponse<CompetitionDashboardDto>>(`${this.baseUrl}/competition/dashboard/${adId}`);
  }

  getMarketInsights(category?: string, location?: string): Observable<GeneralResponse<MarketInsights>> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (location) params.set('location', location);
    
    return this.api.get$<GeneralResponse<MarketInsights>>(`${this.baseUrl}/competition/insights?${params.toString()}`);
  }

  getCompetitionSuggestions(analysisId: string): Observable<GeneralResponse<CompetitionSuggestionsDto>> {
    return this.api.get$<GeneralResponse<CompetitionSuggestionsDto>>(`${this.baseUrl}/competition/suggestions/${analysisId}`);
  }

  generateAISuggestions(adId: string): Observable<GeneralResponse<CompetitionSuggestionsDto>> {
    return this.api.post$<GeneralResponse<CompetitionSuggestionsDto>>(`${this.baseUrl}/competition/ai-suggestions/${adId}`, {});
  }
}