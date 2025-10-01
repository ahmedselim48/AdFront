import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { TenantService } from '../services/tenant.service';

export const tenantInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const tenantService = inject(TenantService);
  const tenantId = tenantService.tenantId;
  // Avoid non-ASCII header values which break fetch/RequestInit in some environments
  const isAscii = (value: string) => /^[\x00-\x7F]*$/.test(value);
  const cloned = tenantId && isAscii(tenantId)
    ? req.clone({ setHeaders: { 'X-Tenant-ID': tenantId } })
    : req;
  return next(cloned);
};


