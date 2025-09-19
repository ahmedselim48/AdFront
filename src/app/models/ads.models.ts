export interface AdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  userName?: string;
  createdAt: string; // ISO string
  viewsCount: number;
  status: 'Pending' | 'Active' | 'Rejected' | 'Archived';
  images: string[]; // full URLs expected from backend
}

export interface CreateAdDto {
  title: string;
  description: string;
  price: number;
  location: string;
  userId: string;
  // for JSON endpoint (no files)
  imageUrls?: string[];
}

export interface UpdateAdDto {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  status: 'Pending' | 'Active' | 'Rejected' | 'Archived';
  // for JSON update (if you send URLs)
  images?: string[];
}

export interface PaginationMeta {
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}
















export type AdStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'archived';

export interface AdVariant {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  isActive: boolean;
}

export interface AdItem {
  id: string;
  name: string;
  category?: string;
  price?: number;
  status: AdStatus;
  scheduleAt?: string;
  variants: AdVariant[];
}
