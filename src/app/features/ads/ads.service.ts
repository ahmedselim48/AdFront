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
          name: ad.title,
          category: ad.location,
          price: ad.price,
          status: ad.status.toLowerCase() as any,
          scheduleAt: ad.createdAt,
          variants: [{
            id: ad.id,
            title: ad.title,
            body: ad.description,
            imageUrl: ad.images?.[0]?.url,
            isActive: ad.status === 'Active'
          }]
        }));
      })
    );
  }
  
  create(ad: Partial<AdItem>): Observable<AdItem> { 
    return this.api.post$('/ads', {
      Title: ad.name,
      Description: ad.variants?.[0]?.body || '',
      Price: ad.price || 0,
      Location: ad.category || ''
    }).pipe(
      map((response: any) => ({
        id: response.Id,
        name: response.Title,
        category: response.Location,
        price: response.Price,
        status: response.Status.toLowerCase() as any,
        scheduleAt: response.CreatedAt,
        variants: [{
          id: response.Id,
          title: response.Title,
          body: response.Description,
          imageUrl: response.Images?.[0]?.Url,
          isActive: response.Status === 'Active'
        }]
      }))
    );
  }
  
  update(id: string, ad: Partial<AdItem>): Observable<AdItem> { 
    return this.api.put$(`/ads/${id}`, {
      Title: ad.name,
      Description: ad.variants?.[0]?.body || '',
      Price: ad.price || 0,
      Location: ad.category || ''
    }).pipe(
      map((response: any) => ({
        id: response.Id,
        name: response.Title,
        category: response.Location,
        price: response.Price,
        status: response.Status.toLowerCase() as any,
        scheduleAt: response.CreatedAt,
        variants: [{
          id: response.Id,
          title: response.Title,
          body: response.Description,
          imageUrl: response.Images?.[0]?.Url,
          isActive: response.Status === 'Active'
        }]
      }))
    );
  }
  
  remove(id: string): Observable<void> { return this.api.delete$(`/ads/${id}`); }
}
