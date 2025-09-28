// ===== CATEGORIES MODELS =====

export interface CategoryDto {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
}

export interface CategoryWithAdsDto extends CategoryDto {
  ads: any[]; // AdDto[]
  totalAds: number;
}

export interface CategorySearchRequest {
  query?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'name' | 'createdAt' | 'adsCount';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedCategoriesResponse {
  data: CategoryDto[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface CategoryPriceRangeDto {
  categoryId: number;
  categoryName: string;
  minPrice: number;
  maxPrice: number;
  averagePrice: number;
  totalAds: number;
}

export interface UpdateCategoryPriceRangeDto {
  minPrice: number;
  maxPrice: number;
}
