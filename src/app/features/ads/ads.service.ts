import { Injectable } from '@angular/core';
import { ApiClientService } from '../../core/services/api-client.service';
import { AdItem } from '../../models/ads.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AdsService {
  constructor(private api: ApiClientService){}

  list(): Observable<AdItem[]> { return this.api.get$('/ads'); }
  create(ad: Partial<AdItem>): Observable<AdItem> { return this.api.post$('/ads', ad); }
  update(id: string, ad: Partial<AdItem>): Observable<AdItem> { return this.api.put$(`/ads/${id}`, ad); }
  remove(id: string): Observable<void> { return this.api.delete$(`/ads/${id}`); }
}
