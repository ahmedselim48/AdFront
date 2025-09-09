import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Log only; no UI notifications per request
      // eslint-disable-next-line no-console
      console.error('[HTTP ERROR]', err);
      return throwError(() => err);
    })
  );
};


