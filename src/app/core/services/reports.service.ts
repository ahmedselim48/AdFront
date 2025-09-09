import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiClientService } from './api-client.service';

@Injectable({ providedIn: 'root' })
export class ReportsService {
  constructor(private api: ApiClientService){}

  download(type: string, from: string, to: string): Observable<Blob> {
    // return this.api.get$(`/Reports/download?type=${type}&from=${from}&to=${to}`, { responseType: 'blob' as any });
    return of(new Blob(['report'], { type: 'text/plain' }));
  }

  saveSchedule(cron: string, type: string): Observable<void> {
    // return this.api.post$<void>('/Reports/schedule', { cron, type });
    return of(void 0);
  }
}


