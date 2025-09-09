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
