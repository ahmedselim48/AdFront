import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GeneralResponse } from '../../models/common.models';

export interface PublicProfileDto {
  id: string;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  whatsappNumber?: string;
  profileImageUrl?: string;
  bio?: string;
  location?: string;
  joinDate: string;
  isVerified: boolean;
  totalAds: number;
  totalViews: number;
  rating: number;
  reviewsCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class PublicProfileService {
  private readonly apiUrl = `${environment.apiUrl}/api/public-profile`;

  constructor(private http: HttpClient) {}

  // Get public profile by user ID
  getPublicProfile(userId: string): Observable<GeneralResponse<PublicProfileDto>> {
    return this.http.get<GeneralResponse<PublicProfileDto>>(`${this.apiUrl}/${userId}`);
  }
}
