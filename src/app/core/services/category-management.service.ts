import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface GeneralResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryManagementService {
  private readonly baseUrl = `${environment.apiUrl}/api/Categories`;

  constructor(private http: HttpClient) {}

  // Get all categories (Admin only)
  getAllCategories(): Observable<GeneralResponse<CategoryDto[]>> {
    return this.http.get<GeneralResponse<CategoryDto[]>>(this.baseUrl);
  }

  // Create a new category
  createCategory(category: CreateCategoryDto): Observable<GeneralResponse<CategoryDto>> {
    return this.http.post<GeneralResponse<CategoryDto>>(this.baseUrl, category);
  }

  // Update a category
  updateCategory(id: number, category: UpdateCategoryDto): Observable<GeneralResponse<CategoryDto>> {
    return this.http.put<GeneralResponse<CategoryDto>>(`${this.baseUrl}/${id}`, category);
  }

  // Delete a category
  deleteCategory(id: number): Observable<GeneralResponse<any>> {
    return this.http.delete<GeneralResponse<any>>(`${this.baseUrl}/${id}`);
  }

  // Get category by ID
  getCategoryById(id: number): Observable<GeneralResponse<CategoryDto>> {
    return this.http.get<GeneralResponse<CategoryDto>>(`${this.baseUrl}/${id}`);
  }
}
