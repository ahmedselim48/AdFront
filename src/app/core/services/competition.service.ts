import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from './api-client.service';

export interface CompetitorRow { name: string; count: number; ctr: number; price?: number; }

@Injectable({ providedIn: 'root' })
export class CompetitionService {
  constructor(private api: ApiClientService){}

  search(keyword: string): Observable<CompetitorRow[]> {
    // return this.api.get$<CompetitorRow[]>(`/Competition?keyword=${encodeURIComponent(keyword)}`);
    return of([
      { name: 'Competitor A', count: 12, ctr: 1.8, price: 29.9 },
      { name: 'Competitor B', count: 8, ctr: 2.1, price: 27.5 },
      { name: 'Competitor C', count: 15, ctr: 1.6, price: 31.0 }
    ]);
  }
}


