import { Injectable } from '@angular/core';
import { ApiClientService } from '../../core/services/api-client.service';
import { Observable, map } from 'rxjs';
import { AdItem, AdSearchRequest, PaginatedAdsResponse, AdPerformanceDto, ABTestDto, CommentDto } from '../../models/ads.models';
import { ImageValidationService } from '../../core/services/image-validation.service';

@Injectable({ providedIn: 'root' })
export class AdsService {
  constructor(
    private api: ApiClientService,
    private imageValidationService: ImageValidationService
  ){}

  list(page = 1, pageSize = 10): Observable<PaginatedAdsResponse> { 
    return this.api.get$<any>(`/ads?page=${page}&pageSize=${pageSize}`).pipe(
      map(response => {
        console.log('API Response:', response);
        console.log('Response type:', typeof response);
        console.log('Response structure:', JSON.stringify(response, null, 2));
        console.log('Response.success:', response?.success);
        console.log('Response.data:', response?.data);
        console.log('Response.meta:', response?.meta);
        
        // Handle GeneralResponse wrapper from backend
        let adsData: AdItem[] = [];
        let totalCount = 0;
        let totalPages = 0;
        
        // Check if response is directly an array (most likely case based on logs)
        if (Array.isArray(response)) {
          console.log('Response is direct array');
          adsData = response.map((ad: any) => ({
            id: ad.id || '',
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price || 0,
            location: ad.location || '',
            categoryId: ad.categoryId,
            categoryName: ad.categoryName || '',
            createdAt: new Date(ad.createdAt || Date.now()),
            viewsCount: ad.viewsCount || 0,
            views: ad.views || 0,
            clicksCount: ad.clicksCount || 0,
            likesCount: ad.likesCount || 0,
            likes: ad.likes || 0,
            commentsCount: ad.commentsCount || 0,
            status: ad.status || 'Draft',
            userId: ad.userId || '',
            userName: ad.userName || 'مستخدم',
            images: ad.images || [],
            keywords: ad.keywords || [],
            isAIGenerated: ad.isAIGenerated || false
          }));
          totalCount = adsData.length;
          totalPages = Math.ceil(totalCount / pageSize);
        }
        // Check if response has GeneralResponse wrapper
        else if (response && response.success && response.data) {
          adsData = response.data.map((ad: any) => ({
            id: ad.id || '',
            title: ad.title || '',
            description: ad.description || '',
            price: ad.price || 0,
            location: ad.location || '',
            categoryId: ad.categoryId,
            categoryName: ad.categoryName || '',
            createdAt: new Date(ad.createdAt || Date.now()),
            viewsCount: ad.viewsCount || 0,
            views: ad.views || 0,
            clicksCount: ad.clicksCount || 0,
            likesCount: ad.likesCount || 0,
            likes: ad.likes || 0,
            commentsCount: ad.commentsCount || 0,
            status: ad.status || 'Draft',
            userId: ad.userId || '',
            userName: ad.userName || 'مستخدم',
            images: ad.images || [],
            keywords: ad.keywords || [],
            isAIGenerated: ad.isAIGenerated || false
          }));
          
          // Extract pagination info from meta if available
          if (response.meta) {
            totalCount = response.meta.TotalCount || response.meta.totalCount || adsData.length;
            totalPages = response.meta.TotalPages || response.meta.totalPages || Math.ceil(totalCount / pageSize);
          } else {
            totalCount = adsData.length;
            totalPages = Math.ceil(totalCount / pageSize);
          }
        }
        else {
          console.log('Unexpected response format:', response);
        }
        
        return {
          data: adsData,
          totalCount: totalCount,
          currentPage: page,
          pageSize: pageSize,
          totalPages: totalPages
        };
      })
    );
  }

  search(searchRequest: AdSearchRequest): Observable<PaginatedAdsResponse> {
    const params = new URLSearchParams();
    if (searchRequest.query) params.append('query', searchRequest.query);
    if (searchRequest.categoryId) params.append('categoryId', searchRequest.categoryId.toString());
    if (searchRequest.minPrice) params.append('minPrice', searchRequest.minPrice.toString());
    if (searchRequest.maxPrice) params.append('maxPrice', searchRequest.maxPrice.toString());
    if (searchRequest.location) params.append('location', searchRequest.location);
    if (searchRequest.status) params.append('status', searchRequest.status);
    if (searchRequest.page) params.append('page', searchRequest.page.toString());
    if (searchRequest.pageSize) params.append('pageSize', searchRequest.pageSize.toString());
    if (searchRequest.sortBy) params.append('sortBy', searchRequest.sortBy);
    if (searchRequest.sortOrder) params.append('sortOrder', searchRequest.sortOrder);

    return this.api.get$<PaginatedAdsResponse>(`/ads/search?${params.toString()}`);
  }

  getById(id: string): Observable<AdItem> {
    return this.api.get$<AdItem>(`/ads/${id}`);
  }

  getByCategory(categoryId: number, page = 1, pageSize = 10): Observable<PaginatedAdsResponse> {
    return this.api.get$<PaginatedAdsResponse>(`/ads/category/${categoryId}?page=${page}&pageSize=${pageSize}`);
  }

  getByStatus(status: string, page = 1, pageSize = 10): Observable<PaginatedAdsResponse> {
    return this.api.get$<PaginatedAdsResponse>(`/ads/status/${status}?page=${page}&pageSize=${pageSize}`);
  }

  getMyAds(status?: string): Observable<AdItem[]> {
    const url = status ? `/ads/my?status=${status}` : '/ads/my';
    return this.api.get$<AdItem[]>(url);
  }

  getDrafts(): Observable<AdItem[]> {
    return this.api.get$<AdItem[]>('/ads/drafts');
  }

  getPublished(): Observable<AdItem[]> {
    return this.api.get$<AdItem[]>('/ads/published');
  }

  getAnalytics(adId: string, startDate?: Date, endDate?: Date): Observable<AdPerformanceDto> {
    let url = `/ads/${adId}/analytics`;
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate.toISOString());
    if (endDate) params.append('endDate', endDate.toISOString());
    if (params.toString()) url += `?${params.toString()}`;
    
    return this.api.get$<AdPerformanceDto>(url);
  }
  
  create(ad: Partial<AdItem>): Observable<AdItem> { 
    return this.api.post$('/ads', {
      Title: ad.title,
      Description: ad.description || '',
      Price: ad.price || 0,
      Location: ad.location || '',
      CategoryId: ad.categoryId,
      Keywords: ad.keywords || [],
      ImageUrls: ad.images || []
    }).pipe(
      map((response: any) => ({
        id: response.Id,
        title: response.Title,
        description: response.Description,
        location: response.Location,
        price: response.Price,
        createdAt: new Date(response.CreatedAt),
        viewsCount: 0,
        views: 0,
        clicksCount: 0,
        likesCount: 0,
        likes: 0,
        commentsCount: 0,
        status: response.Status,
        userId: response.UserId || '',
        userName: 'User',
        images: response.Images || [],
        keywords: response.Keywords || [],
        isAIGenerated: false,
        categoryId: response.CategoryId,
        categoryName: response.CategoryName
      }))
    );
  }

  createWithFiles(ad: Partial<AdItem>, files: File[]): Observable<AdItem> {
    const validationResult = this.imageValidationService.validateImageFiles(files);
    const validFiles = validationResult.validFiles;

    const formData = new FormData();
    formData.append('Title', ad.title || '');
    formData.append('Description', ad.description || '');
    formData.append('Price', (ad.price || 0).toString());
    formData.append('Location', ad.location || '');
    if (ad.categoryId) formData.append('CategoryId', ad.categoryId.toString());
    if (ad.keywords) formData.append('Keywords', JSON.stringify(ad.keywords));
    
    // Contact Information
    if (ad.contactNumber) formData.append('ContactNumber', ad.contactNumber);
    if (ad.contactMethod) formData.append('ContactMethod', ad.contactMethod);
    
    // Add valid images only
    validFiles.forEach((file, index) => {
      formData.append(`Images`, file);
    });

    return this.api.post$('/ads/create-with-files', formData);
  }
  
  update(id: string, ad: Partial<AdItem>): Observable<AdItem> { 
    const formData = new FormData();
    if (ad.title) formData.append('Title', ad.title);
    if (ad.description) formData.append('Description', ad.description);
    if (ad.price !== undefined) formData.append('Price', ad.price.toString());
    if (ad.location) formData.append('Location', ad.location);
    if (ad.categoryId) formData.append('CategoryId', ad.categoryId.toString());
    if (ad.keywords && ad.keywords.length > 0) {
      ad.keywords.forEach(keyword => {
        formData.append('Keywords', keyword);
      });
    }
    
    // Contact Information
    if (ad.contactNumber) formData.append('ContactNumber', ad.contactNumber);
    if (ad.contactMethod) formData.append('ContactMethod', ad.contactMethod);

    return this.api.put$(`/ads/${id}`, formData);
  }

  updateWithFiles(id: string, ad: Partial<AdItem>, files: File[]): Observable<AdItem> {
    const validationResult = this.imageValidationService.validateImageFiles(files);
    const validFiles = validationResult.validFiles;

    const formData = new FormData();
    if (ad.title) formData.append('Title', ad.title);
    if (ad.description) formData.append('Description', ad.description);
    if (ad.price !== undefined) formData.append('Price', ad.price.toString());
    if (ad.location) formData.append('Location', ad.location);
    if (ad.categoryId) formData.append('CategoryId', ad.categoryId.toString());
    if (ad.keywords && ad.keywords.length > 0) {
      ad.keywords.forEach(keyword => {
        formData.append('Keywords', keyword);
      });
    }
    
    // Contact Information
    if (ad.contactNumber) formData.append('ContactNumber', ad.contactNumber);
    if (ad.contactMethod) formData.append('ContactMethod', ad.contactMethod);
    
    // Add valid new images only
    validFiles.forEach((file, index) => {
      formData.append(`NewImages`, file);
    });

    return this.api.put$(`/ads/${id}`, formData);
  }

  publish(id: string, publishRequest: any): Observable<AdItem> {
    return this.api.post$(`/ads/${id}/publish`, publishRequest);
  }

  like(id: string): Observable<void> {
    return this.api.post$(`/ads/${id}/like`, {});
  }

  unlike(id: string): Observable<void> {
    return this.api.post$(`/ads/${id}/unlike`, {});
  }

  checkIfLiked(id: string): Observable<boolean> {
    return this.api.get$<any>(`/ads/${id}/is-liked`).pipe(
      map(response => response?.isLiked || false)
    );
  }

  view(id: string): Observable<void> {
    return this.api.post$(`/ads/${id}/view`, {});
  }

  click(id: string): Observable<void> {
    return this.api.post$(`/ads/${id}/click`, {});
  }

  addComment(id: string, content: string): Observable<CommentDto> {
    return this.api.post$(`/ads/${id}/comments`, { content });
  }

  getComments(id: string): Observable<CommentDto[]> {
    return this.api.get$<CommentDto[]>(`/ads/${id}/comments`);
  }

  deleteComment(commentId: string): Observable<void> {
    return this.api.delete$(`/ads/comments/${commentId}`);
  }

  startABTest(adAId: string, adBId: string, endsAt: Date): Observable<ABTestDto> {
    return this.api.post$('/ads/ab-tests/start', {
      adAId,
      adBId,
      endsAtUtc: endsAt.toISOString()
    });
  }

  getABTestResult(testId: string): Observable<ABTestDto> {
    return this.api.get$<ABTestDto>(`/ads/ab-tests/${testId}`);
  }

  endABTest(testId: string): Observable<ABTestDto> {
    return this.api.post$(`/ads/ab-tests/${testId}/end`, {});
  }
  
  remove(id: string): Observable<void> { 
    return this.api.delete$(`/ads/${id}`); 
  }
}
