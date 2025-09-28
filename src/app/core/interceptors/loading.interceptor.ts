import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private activeRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain requests
    if (this.shouldSkipLoading(req)) {
      return next.handle(req);
    }

    this.activeRequests++;
    this.loadingService.setLoading(true);

    return next.handle(req).pipe(
      finalize(() => {
        this.activeRequests--;
        if (this.activeRequests === 0) {
          this.loadingService.setLoading(false);
        }
      })
    );
  }

  private shouldSkipLoading(req: HttpRequest<any>): boolean {
    // Skip loading for background requests or specific endpoints
    const skipLoadingEndpoints = [
      '/api/notifications/unread-count',
      '/api/ads/increment-view',
      '/api/ads/like'
    ];

    return skipLoadingEndpoints.some(endpoint => req.url.includes(endpoint));
  }
}
