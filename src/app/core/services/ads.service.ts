import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';
import { AdDto, AdImageDto, AdStatus, CreateAdDto, UpdateAdDto, AdFilters } from '../../models/profile.models';

// Ad-related interfaces are now imported from profile.models.ts

@Injectable({
  providedIn: 'root'
})
export class AdsService {
  private readonly apiUrl = `${environment.apiUrl}/api/ads`;

  constructor(private http: HttpClient) {}

  // Get user's ads
  getMyAds(status?: AdStatus): Observable<GeneralResponse<AdDto[]>> {
    let params = new HttpParams();
    if (status) {
      params = params.set('status', status);
    }
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.apiUrl}/my`, { params });
  }

  // Get draft ads
  getDraftAds(): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.apiUrl}/drafts`);
  }

  // Get published ads
  getPublishedAds(): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.apiUrl}/published`);
  }

  // List all ads (for home page)
  list(page: number = 1, pageSize: number = 10, filters?: AdFilters): Observable<GeneralResponse<AdDto[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
    
    if (filters) {
      if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
      if (filters.location) params = params.set('location', filters.location);
      if (filters.minPrice) params = params.set('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) params = params.set('maxPrice', filters.maxPrice.toString());
      if (filters.keyword) params = params.set('keyword', filters.keyword);
    }
    
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.apiUrl}`, { params });
  }

  // Get ad by ID
  getAdById(adId: string): Observable<GeneralResponse<AdDto>> {
    return this.http.get<GeneralResponse<AdDto>>(`${this.apiUrl}/${adId}`);
  }

  // Create new ad
  createAd(adData: CreateAdDto): Observable<GeneralResponse<AdDto>> {
    return this.http.post<GeneralResponse<AdDto>>(`${this.apiUrl}`, adData);
  }

  // Update ad
  updateAd(adId: string, adData: UpdateAdDto): Observable<GeneralResponse<AdDto>> {
    return this.http.put<GeneralResponse<AdDto>>(`${this.apiUrl}/${adId}`, adData);
  }

  // Delete ad
  deleteAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.delete<GeneralResponse<boolean>>(`${this.apiUrl}/${adId}`);
  }

  // Publish ad
  publishAd(adId: string): Observable<GeneralResponse<AdDto>> {
    return this.http.post<GeneralResponse<AdDto>>(`${this.apiUrl}/${adId}/publish`, {});
  }

  // Like ad
  likeAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.apiUrl}/${adId}/like`, {});
  }

  // Unlike ad
  unlikeAd(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.apiUrl}/${adId}/unlike`, {});
  }

  // Increment view count
  incrementView(adId: string): Observable<GeneralResponse<boolean>> {
    return this.http.post<GeneralResponse<boolean>>(`${this.apiUrl}/${adId}/view`, {});
  }

  // Get ads by user ID (public)
  getAdsByUserId(userId: string): Observable<GeneralResponse<AdDto[]>> {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.apiUrl}/user/${userId}`);
  }

  // Create ad with files
  createWithFiles(adData: CreateAdDto & { files: File[] }): Observable<GeneralResponse<AdDto>> {
    const formData = new FormData();
    
    // Add ad data
    formData.append('title', adData.title);
    formData.append('description', adData.description);
    formData.append('price', adData.price.toString());
    if (adData.categoryId) formData.append('categoryId', adData.categoryId.toString());
    if (adData.location) formData.append('location', adData.location);
    if (adData.contactInfo) formData.append('contactInfo', adData.contactInfo);
    if (adData.tags) formData.append('tags', JSON.stringify(adData.tags));
    
    // Add files
    adData.files.forEach((file, index) => {
      formData.append(`images`, file);
    });

    return this.http.post<GeneralResponse<AdDto>>(`${this.apiUrl}/create-with-files`, formData);
  }

  // Analyze images (AI feature - temporarily disabled)
  analyzeImages(adId: string): Observable<GeneralResponse<any>> {
    return this.http.post<GeneralResponse<any>>(`${this.apiUrl}/${adId}/analyze-images`, {});
  }

  // Get all ads (for ads-list component)
  getAll(page: number = 1, pageSize: number = 20, filters?: AdFilters): Observable<GeneralResponse<AdDto[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (filters?.status) {
      params = params.set('status', filters.status);
    }
    if (filters?.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters?.searchTerm) {
      params = params.set('searchTerm', filters.searchTerm);
    }
    if (filters?.minPrice) {
      params = params.set('minPrice', filters.minPrice.toString());
    }
    if (filters?.maxPrice) {
      params = params.set('maxPrice', filters.maxPrice.toString());
    }
    if (filters?.dateFrom) {
      params = params.set('dateFrom', filters.dateFrom);
    }
    if (filters?.dateTo) {
      params = params.set('dateTo', filters.dateTo);
    }

    return this.http.get<GeneralResponse<AdDto[]>>(this.apiUrl, { params });
  }
}