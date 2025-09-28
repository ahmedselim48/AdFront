import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/general-response';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private http: HttpClient) {}

  get baseUrl(): string {
    return environment.apiBaseUrl;
  }

  get$<T>(url: string, options?: object): Observable<T> {
    return this.http.get<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  post$<T>(url: string, body: unknown, options?: object): Observable<T> {
    return this.http.post<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  put$<T>(url: string, body: unknown, options?: object): Observable<T> {
    return this.http.put<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  delete$<T>(url: string, options?: object): Observable<T> {
    return this.http.delete<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, options).pipe(map(r => unwrapResponse<T>(r)));
  }

  // Get raw response without unwrapping
  getRaw$<T>(url: string, options?: object): Observable<GeneralResponse<T>> {
    return this.http.get<GeneralResponse<T>>(`${this.baseUrl}${url}`, options);
  }

  postRaw$<T>(url: string, body: unknown, options?: object): Observable<GeneralResponse<T>> {
    return this.http.post<GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options);
  }

  putRaw$<T>(url: string, body: unknown, options?: object): Observable<GeneralResponse<T>> {
    return this.http.put<GeneralResponse<T>>(`${this.baseUrl}${url}`, body, options);
  }

  deleteRaw$<T>(url: string, options?: object): Observable<GeneralResponse<T>> {
    return this.http.delete<GeneralResponse<T>>(`${this.baseUrl}${url}`, options);
  }

  // For file downloads
  getBlob$(url: string, options?: object): Observable<Blob> {
    return this.http.get(`${this.baseUrl}${url}`, { ...options, responseType: 'blob' });
  }

  // For file uploads with progress
  postWithProgress$<T>(url: string, formData: FormData, options?: object): Observable<T> {
    return this.http.post<T | GeneralResponse<T>>(`${this.baseUrl}${url}`, formData, options).pipe(map(r => unwrapResponse<T>(r)));
  }
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
