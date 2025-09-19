import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdDto, PaginationMeta, CreateAdDto, UpdateAdDto } from '../../models/ads.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class AdsService {

 private base = `${environment.apiBaseUrl}/api/Ads`; // set environment.apiUrl

  constructor(private http: HttpClient) {}

  // Get all with pagination
  getAll(page = 1, pageSize = 10): Observable<{ data: AdDto[]; meta?: PaginationMeta; raw: GeneralResponse<AdDto[]> }> {
    const params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));
    return this.http.get<GeneralResponse<AdDto[]>>(this.base, { params })
      .pipe(map(res => ({ data: res.data ?? [], meta: res.meta, raw: res })));
  }

  getById(id: string) {
    return this.http.get<GeneralResponse<AdDto>>(`${this.base}/${id}`);
  }

  getByUserId(userId: string) {
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/user/${userId}`);
  }

  getByStatus(status: string) {
    // status can be 'Active' or numeric if backend accepts numbers
    return this.http.get<GeneralResponse<AdDto[]>>(`${this.base}/status/${encodeURIComponent(status)}`);
  }

  // Create using JSON (urls)
  create(dto: CreateAdDto) {
    return this.http.post<GeneralResponse<AdDto>>(this.base, dto);
  }

  // Create with files (multipart/form-data)
  createWithFiles(form: {
    title: string;
    description: string;
    price: number;
    location: string;
    userId: string;
    images?: File[];
  }) {
    const fd = new FormData();
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', String(form.price));
    fd.append('location', form.location);
    fd.append('userId', form.userId);
    if (form.images) {
      form.images.forEach(file => fd.append('images', file, file.name)); // backend expects 'images' array
    }
    return this.http.post<GeneralResponse<AdDto>>(`${this.base}/create-with-files`, fd);
  }

  // Update using JSON (image URLs)
  update(dto: UpdateAdDto) {
    return this.http.put<GeneralResponse<AdDto>>(`${this.base}/${dto.id}`, dto);
  }

  // Update with files (optional): accept FormData same pattern as create
  updateWithFiles(id: string, form: {
    title: string;
    description: string;
    price: number;
    location: string;
    status: string;
    images?: File[]; // will replace images on backend as implemented
  }) {
    const fd = new FormData();
    fd.append('id', id);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('price', String(form.price));
    fd.append('location', form.location);
    fd.append('status', form.status);
    if (form.images) form.images.forEach(f => fd.append('images', f, f.name));
    return this.http.put<GeneralResponse<AdDto>>(`${this.base}/${id}`, fd);
  }

  delete(id: string) {
    return this.http.delete<GeneralResponse<boolean>>(`${this.base}/${id}`);
  }
}