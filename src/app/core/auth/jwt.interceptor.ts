import { HttpErrorResponse, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, firstValueFrom, Observable, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { TokenStorageService } from './token-storage.service';

let isRefreshing = false;
let pendingRequests: { resolve: (token: string | null) => void; reject: (err: unknown) => void; }[] = [];

export const jwtInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);
  const storage = inject(TokenStorageService);

  const token = storage.accessToken;
  const cloned = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        return handle401(auth, storage, cloned, next);
      }
      return throwError(() => err);
    })
  );
};

function handle401(auth: AuthService, storage: TokenStorageService, req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  if (!storage.refreshToken) {
    auth.logout();
    return throwError(() => new Error('Unauthorized'));
  }

  if (isRefreshing) {
    return new Observable(subscriber => {
      pendingRequests.push({
        resolve: (token) => {
          const retried = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
          next(retried).subscribe({ next: v => subscriber.next(v), error: e => subscriber.error(e), complete: () => subscriber.complete() });
        },
        reject: (e) => subscriber.error(e)
      });
    });
  }

  isRefreshing = true;
  return auth.refresh(storage.refreshToken).pipe(
    switchMap(t => {
      const newToken = t.accessToken;
      pendingRequests.forEach(p => p.resolve(newToken));
      pendingRequests = [];
      const retried = req.clone({ setHeaders: { Authorization: `Bearer ${newToken}` } });
      return next(retried);
    }),
    catchError(e => {
      pendingRequests.forEach(p => p.reject(e));
      pendingRequests = [];
      auth.logout();
      return throwError(() => e);
    }),
    finalize(() => { isRefreshing = false; })
  );
}
