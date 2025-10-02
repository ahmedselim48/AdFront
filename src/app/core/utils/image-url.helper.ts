import { environment } from '../../../environments/environment';

export class ImageUrlHelper {
  /**
   * Convert relative image URL to absolute URL pointing to backend
   */
  static getFullImageUrl(imageUrl: string | undefined | null): string | null {
    if (!imageUrl) return null;
    
    // If already absolute URL, return as is
    if (/^https?:\/\//i.test(imageUrl)) {
      return imageUrl;
    }
    
    // Get backend base URL (remove /api suffix if present)
    const backendUrl = environment.apiUrl.replace(/\/api$/, '');
    
    // Ensure imageUrl starts with /
    const path = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
    return `${backendUrl}${path}`;
  }

  /**
   * Get profile image URL with fallback to default avatar
   */
  static getProfileImageUrl(profileImageUrl: string | undefined | null): string {
    const fullUrl = this.getFullImageUrl(profileImageUrl);
    return fullUrl || '/assets/images/default-avatar.svg';
  }

  /**
   * Get ad image URL with fallback to placeholder
   */
  static getAdImageUrl(imageUrl: string | undefined | null): string {
    const fullUrl = this.getFullImageUrl(imageUrl);
    return fullUrl || '/assets/images/placeholder-ad.svg';
  }
}
