import { Injectable } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable, map } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  description?: string;
  minPrice?: number;
  maxPrice?: number;
  createdAt: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private api: ApiClientService) {}

  getCategories(): Observable<Category[]> {
    return this.api.get$<any>('/public/publiccategories').pipe(
      map((response: any) => {
        // Handle GeneralResponse wrapper from backend
        if (response && response.data) {
          return response.data;
        }
        return response || [];
      })
    );
  }

  getCategoryById(id: number): Observable<Category> {
    return this.api.get$<Category>(`/categories/${id}`);
  }

  createCategory(category: Partial<Category>): Observable<Category> {
    return this.api.post$<Category>('/categories', category);
  }

  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    return this.api.put$<Category>(`/categories/${id}`, category);
  }

  deleteCategory(id: number): Observable<void> {
    return this.api.delete$(`/categories/${id}`);
  }
}
