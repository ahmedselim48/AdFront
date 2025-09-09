import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { KpiSummary } from '../../models/dashboard.models';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  constructor(private api: ApiClientService){}

  // Replace stubs with real endpoints when available
  getSummary(): Observable<KpiSummary> {
    // return this.api.get$<KpiSummary>('/Analytics/summary');
    return of({ views: 12540, messages: 812, conversions: 146, ctr: 2.3, alerts: 3 });
  }

  getPerformanceSeries(): Observable<{ label: string; values: number[] }[]> {
    // return this.api.get$<{ label: string; values: number[] }[]>('/Analytics/performance');
    return of([{ label: 'Performance', values: [120, 180, 140, 220, 260, 200, 280] }]);
  }
}


