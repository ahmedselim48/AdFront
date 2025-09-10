import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private http: HttpClient) {}

  get baseUrl(): string {
    return environment.apiBaseUrl;
  }

  get$<T>(url: string, options?: object) {
    return this.http.get<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  post$<T>(url: string, body: unknown, options?: object) {
    return this.http.post<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  put$<T>(url: string, body: unknown, options?: object) {
    return this.http.put<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  delete$<T>(url: string, options?: object) {
    return this.http.delete<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, options).pipe(map(r => unwrapResponse<T>(r)));
  }
}

// Types matching backend wrapper
interface GeneralResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

function isWrapped<T>(value: unknown): value is GeneralResponse<T> {
  return !!value && typeof value === 'object' && 'success' in (value as any) && 'message' in (value as any);
}

function unwrapResponse<T>(response: T | GeneralResponse<T>): T {
  if (isWrapped<T>(response)) {
    if ((response as GeneralResponse<T>).success) {
      return (response as GeneralResponse<T>).data as T;
    }
    // In case of error responses, throw with message/errors to be caught by interceptors/callers
    const err: any = new Error((response as GeneralResponse<T>).message || 'Request failed');
    err.error = {
      message: (response as GeneralResponse<T>).message,
      errors: (response as GeneralResponse<T>).errors
    };
    throw err;
  }
  return response as T;
}
