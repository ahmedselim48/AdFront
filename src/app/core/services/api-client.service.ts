import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private http: HttpClient) {}

  get baseUrl(): string {
    return environment.apiBaseUrl;
  }

  get$<T>(url: string, options?: object) {
    return this.http.get<T>(`${this.baseUrl}${url}`, options);
  }

  post$<T>(url: string, body: unknown, options?: object) {
    return this.http.post<T>(`${this.baseUrl}${url}`, body, options);
  }

  put$<T>(url: string, body: unknown, options?: object) {
    return this.http.put<T>(`${this.baseUrl}${url}`, body, options);
  }

  delete$<T>(url: string, options?: object) {
    return this.http.delete<T>(`${this.baseUrl}${url}`, options);
  }
}
