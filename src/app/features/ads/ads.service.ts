import { Injectable } from '@angular/core';
import { ApiClientService } from '../../core/services/api-client.service';
import { Observable, map } from 'rxjs';
import { AdItem } from '../../models/ads.models';

@Injectable({ providedIn: 'root' })
export class AdsService {
  constructor(private api: ApiClientService){}

  list(): Observable<AdItem[]> { 
    return this.api.get$<{ads: any[], totalCount: number, page: number, pageSize: number, totalPages: number}>('/ads').pipe(
      map(response => {
        console.log('API Response:', response);
        const ads = response.ads || [];
        return ads.map(ad => ({
          id: ad.id,
          title: ad.title,
          description: ad.description,
          location: ad.location,
          price: ad.price,
          createdAt: new Date(ad.createdAt),
          viewsCount: ad.viewsCount || 0,
          clicksCount: ad.clicksCount || 0,
          likesCount: ad.likesCount || 0,
          commentsCount: ad.commentsCount || 0,
          status: ad.status,
          userName: ad.userName || 'User',
          images: ad.images || [],
          keywords: ad.keywords || [],
          isAIGenerated: ad.isAIGenerated || false,
          categoryId: ad.categoryId,
          categoryName: ad.categoryName
        }));
      })
    );
  }
  
  create(ad: Partial<AdItem>): Observable<AdItem> { 
    return this.api.post$('/ads', {
      Title: ad.title,
      Description: ad.description || '',
      Price: ad.price || 0,
      Location: ad.location || ''
    }).pipe(
      map((response: any) => ({
        id: response.Id,
        title: response.Title,
        description: response.Description,
        location: response.Location,
        price: response.Price,
        createdAt: new Date(response.CreatedAt),
        viewsCount: 0,
        clicksCount: 0,
        likesCount: 0,
        commentsCount: 0,
        status: response.Status,
        userName: 'User',
        images: [],
        keywords: [],
        isAIGenerated: false,
        categoryId: response.CategoryId,
        categoryName: response.CategoryName
      }))
    );
  }
  
  update(id: string, ad: Partial<AdItem>): Observable<AdItem> { 
    return this.api.put$(`/ads/${id}`, {
      Title: ad.title,
      Description: ad.description || '',
      Price: ad.price || 0,
      Location: ad.location || ''
    }).pipe(
      map((response: any) => ({
        id: response.Id,
        title: response.Title,
        description: response.Description,
        location: response.Location,
        price: response.Price,
        createdAt: new Date(response.CreatedAt),
        viewsCount: response.ViewsCount || 0,
        clicksCount: response.ClicksCount || 0,
        likesCount: response.LikesCount || 0,
        commentsCount: response.CommentsCount || 0,
        status: response.Status,
        userName: response.UserName || 'User',
        images: response.Images || [],
        keywords: response.Keywords || [],
        isAIGenerated: response.IsAIGenerated || false,
        categoryId: response.CategoryId,
        categoryName: response.CategoryName
      }))
    );
  }
  
  remove(id: string): Observable<void> { return this.api.delete$(`/ads/${id}`); }
}
