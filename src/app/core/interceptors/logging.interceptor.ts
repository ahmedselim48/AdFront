import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    
    return next.handle(req).pipe(
      tap(
        (event) => {
          const duration = Date.now() - startTime;
          console.log(`HTTP ${req.method} ${req.url} - ${duration}ms`);
        },
        (error) => {
          const duration = Date.now() - startTime;
          console.error(`HTTP ${req.method} ${req.url} - ${duration}ms - ERROR:`, error);
        }
      )
    );
  }
}
