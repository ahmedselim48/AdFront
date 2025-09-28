import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  AdDto, 
  CreateAdCommand, 
  CreateAdWithFilesCommand,
  UpdateAdManagementCommand,
  AdSearchRequest,
  PaginatedAdsResponse,
  AdGenerationResponse,
  AdAnalysisResult,
  StartAdABTestRequest,
  ABTestDto,
  ABTestResult,
  CommentDto,
  AdminAdDto,
  AdStatus
} from '../../models/ads.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

 private base = `${environment.apiBaseUrl}/Ads`; // set environment.apiUrl

  constructor(private http: HttpClient) {}

  // Get all with pagination
  getAll(page = 1, pageSize = 10): Observable<GeneralResponse<PaginatedAdsResponse>> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<GeneralResponse<PaginatedAdsResponse>>(this.base, { params });
  }

  getById(id: string): Observable<GeneralResponse<AdDto>> {
    return this.http.get<GeneralResponse<AdDto>>(`${this.base}/${id}`);
  }

  getByUserId(userId: string): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/user/${userId}`);
  }

  getMyAds(status?: AdStatus): Observable<GeneralResponse<AdDto[]>> {
    const params = status ? new HttpParams().set('status', status) : new HttpParams();
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/my`, { params });
  }

  getDraftAds(): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/drafts`);
  }

  getPublishedAds(): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/published`);
  }

  getPendingAds(): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/pending`);
  }

  getByStatus(status: AdStatus): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/status/${status}`);
  }

  getByCategory(categoryId: number): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/category/${categoryId}`);
  }

  searchAds(searchRequest: AdSearchRequest): Observable<GeneralResponse<AdDto[]>> {
    const params = new HttpParams()
      .set('query', searchRequest.query || '')
      .set('categoryId', String(searchRequest.categoryId || ''))
      .set('minPrice', String(searchRequest.minPrice || ''))
      .set('maxPrice', String(searchRequest.maxPrice || ''))
      .set('location', searchRequest.location || '')
      .set('status', searchRequest.status || '')
      .set('page', String(searchRequest.page || 1))
      .set('pageSize', String(searchRequest.pageSize || 10))
      .set('sortBy', searchRequest.sortBy || 'date')
      .set('sortOrder', searchRequest.sortOrder || 'desc');
    
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/search`, { params });
  }

  // Create using JSON (urls)
  create(dto: CreateAdCommand): Observable<GeneralResponse<AdDto>> {
    return this.http.post<GeneralResponse<AdDto>>(this.base, dto);
  }

  // Create with files (multipart/form-data)
  createWithFiles(form: CreateAdWithFilesCommand): Observable<GeneralResponse<AdDto>> {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', String(form.price));
    fd.append('location', form.location);
    fd.append('userId', form.userId);
    if (form.categoryId) {
      fd.append('categoryId', String(form.categoryId));
    }
    if (form.keywords) {
      form.keywords.forEach(keyword => fd.append('keywords', keyword));
    }
    if (form.images) {
      form.images.forEach(file => fd.append('images', file, file.name));
    }
    return this.http.post<GeneralResponse<AdDto>>(`${this.base}/create-with-files`, fd);
  }

  // Generate ad content with AI
  generateAdContent(form: any): Observable<GeneralResponse<AdGenerationResponse>> {
    const fd = new FormData();
    fd.append('productName', form.productName);
    fd.append('initialDescription', form.initialDescription);
    fd.append('price', String(form.price));
    fd.append('userId', form.userId);
    if (form.categoryId) {
      fd.append('categoryId', String(form.categoryId));
    }
    if (form.images) {
      form.images.forEach((file: File) => fd.append('images', file, file.name));
    }
    return this.http.post<GeneralResponse<AdGenerationResponse>>(`${this.base}/generate`, fd);
  }

  // Create draft ad
  createDraftAd(form: any): Observable<GeneralResponse<AdDto>> {
    const fd = new FormData();
    fd.append('productName', form.productName);
    fd.append('initialDescription', form.initialDescription);
    fd.append('price', String(form.price));
    fd.append('userId', form.userId);
    if (form.categoryId) {
      fd.append('categoryId', String(form.categoryId));
    }
    if (form.images) {
      form.images.forEach((file: File) => fd.append('images', file, file.name));
    }
    return this.http.post<GeneralResponse<AdDto>>(`${this.base}/create-draft`, fd);
  }

  // Publish ad
  publishAd(adId: string, request: any): Observable<GeneralResponse<AdDto>> {
    return this.http.post<GeneralResponse<AdDto>>(`${this.base}/${adId}/publish`, request);
  }

  // Update ad
  updateAd(id: string, form: UpdateAdManagementCommand): Observable<GeneralResponse<AdDto>> {
    const fd = new FormData();
    fd.append('adId', id);
    fd.append('userId', form.userId);
    if (form.title) fd.append('title', form.title);
    if (form.description) fd.append('description', form.description);
    if (form.price) fd.append('price', String(form.price));
    if (form.location) fd.append('location', form.location);
    if (form.categoryId) fd.append('categoryId', String(form.categoryId));
    if (form.keywords) {
      form.keywords.forEach(keyword => fd.append('keywords', keyword));
    }
    if (form.newImages) {
      form.newImages.forEach(file => fd.append('newImages', file, file.name));
    }
    if (form.imagesToDelete) {
      form.imagesToDelete.forEach(url => fd.append('imagesToDelete', url));
    }
    return this.http.put<GeneralResponse<AdDto>>(`${this.base}/${id}`, fd);
  }

  delete(id: string): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.base}/${id}`);
  }

  // Ad interactions
  incrementView(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.base}/${adId}/view`, {});
  }

  incrementClick(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.base}/${adId}/click`, {});
  }

  likeAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.base}/${adId}/like`, {});
  }

  unlikeAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.base}/${adId}/unlike`, {});
  }

  // Comments
  addComment(adId: string, content: string): Observable<GeneralResponse<CommentDto>> {
    return this.http.post<GeneralResponse<CommentDto>>(`${this.base}/${adId}/comments`, content);
  }

  getComments(adId: string): Observable<GeneralResponse<CommentDto[]>> {
    return this.http.get<GeneralResponse<CommentDto[]>>(`${this.base}/${adId}/comments`);
  }

  deleteComment(commentId: string): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.base}/comments/${commentId}`);
  }

  // A/B Testing
  startABTest(request: StartAdABTestRequest): Observable<GeneralResponse<ABTestDto>> {
    return this.http.post<GeneralResponse<ABTestDto>>(`${this.base}/ab-tests/start`, request);
  }

  getABTestResult(testId: string): Observable<GeneralResponse<ABTestResult>> {
    return this.http.get<GeneralResponse<ABTestResult>>(`${this.base}/ab-tests/${testId}`);
  }

  // AI Analysis
  analyzeImages(adId: string): Observable<GeneralResponse<AdAnalysisResult>> {
    return this.http.post<GeneralResponse<AdAnalysisResult>>(`${this.base}/${adId}/analyze-images`, {});
  }
}