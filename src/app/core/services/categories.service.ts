import { Injectable, inject } from '@angular/core';
import { ApiClientService } from './api-client.service';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  CategoryDto, 
  CreateCategoryDto, 
  UpdateCategoryDto, 
  CategoryWithAdsDto,
  CategorySearchRequest,
  PaginatedCategoriesResponse,
  CategoryPriceRangeDto,
  UpdateCategoryPriceRangeDto
} from '../../models/categories.models';
import { GeneralResponse } from '../../models/general-response';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private api = inject(ApiClientService);
  private baseUrl = environment.apiBaseUrl;

  // Public endpoints
  getAllCategories(): Observable<GeneralResponse<CategoryDto[]>> {
    return this.api.get$<GeneralResponse<CategoryDto[]>>(`${this.baseUrl}/public/categories`);
  }

  getCategoryById(id: number): Observable<GeneralResponse<CategoryDto>> {
    return this.api.get$<GeneralResponse<CategoryDto>>(`${this.baseUrl}/public/categories/${id}`);
  }

  getCategoryWithAds(id: number): Observable<GeneralResponse<CategoryWithAdsDto>> {
    return this.api.get$<GeneralResponse<CategoryWithAdsDto>>(`${this.baseUrl}/public/categories/${id}/with-ads`);
  }

  searchCategories(searchRequest: CategorySearchRequest): Observable<GeneralResponse<PaginatedCategoriesResponse>> {
    const params = new URLSearchParams();
    if (searchRequest.query) params.set('query', searchRequest.query);
    if (searchRequest.page) params.set('page', String(searchRequest.page));
    if (searchRequest.pageSize) params.set('pageSize', String(searchRequest.pageSize));
    if (searchRequest.sortBy) params.set('sortBy', searchRequest.sortBy);
    if (searchRequest.sortOrder) params.set('sortOrder', searchRequest.sortOrder);

    return this.api.get$<GeneralResponse<PaginatedCategoriesResponse>>(`${this.baseUrl}/public/categories/search?${params.toString()}`);
  }

  // Admin endpoints
  getAllCategoriesAdmin(): Observable<GeneralResponse<CategoryDto[]>> {
    return this.api.get$<GeneralResponse<CategoryDto[]>>(`${this.baseUrl}/admin/categories`);
  }

  getCategoryByIdAdmin(id: number): Observable<GeneralResponse<CategoryDto>> {
    return this.api.get$<GeneralResponse<CategoryDto>>(`${this.baseUrl}/admin/categories/${id}`);
  }

  getCategoryWithAdsAdmin(id: number): Observable<GeneralResponse<CategoryWithAdsDto>> {
    return this.api.get$<GeneralResponse<CategoryWithAdsDto>>(`${this.baseUrl}/admin/categories/${id}/with-ads`);
  }

  createCategory(dto: CreateCategoryDto): Observable<GeneralResponse<CategoryDto>> {
    return this.api.post$<GeneralResponse<CategoryDto>>(`${this.baseUrl}/admin/categories`, dto);
  }

  updateCategory(id: number, dto: UpdateCategoryDto): Observable<GeneralResponse<CategoryDto>> {
    return this.api.put$<GeneralResponse<CategoryDto>>(`${this.baseUrl}/admin/categories/${id}`, dto);
  }

  deleteCategory(id: number): Observable<GeneralResponse<boolean>> {
    return this.api.delete$<GeneralResponse<boolean>>(`${this.baseUrl}/admin/categories/${id}`);
  }

  // Price ranges
  getCategoriesWithPriceRanges(includeInactive = false): Observable<GeneralResponse<CategoryPriceRangeDto[]>> {
    return this.api.get$<GeneralResponse<CategoryPriceRangeDto[]>>(`${this.baseUrl}/categories/with-price-ranges?includeInactive=${includeInactive}`);
  }

  updateCategoryPriceRanges(id: number, dto: UpdateCategoryPriceRangeDto): Observable<GeneralResponse<CategoryPriceRangeDto>> {
    return this.api.put$<GeneralResponse<CategoryPriceRangeDto>>(`${this.baseUrl}/categories/${id}/price-ranges`, dto);
  }

  getCategoryPriceRanges(id: number): Observable<GeneralResponse<CategoryPriceRangeDto>> {
    return this.api.get$<GeneralResponse<CategoryPriceRangeDto>>(`${this.baseUrl}/categories/${id}/price-ranges`);
  }
}
